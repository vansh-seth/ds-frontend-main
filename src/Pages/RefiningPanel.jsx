import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button, Checkbox, Select, Modal, Table, Input, Space, Collapse, Spin, Typography, Alert, Tag } from 'antd';
import shortid from 'shortid'; 
const { Option } = Select;

const RefiningPanel = ({ selectedColumns, onRefine }) => {
  const [operations, setOperations] = useState({});
  const [isClusterModalVisible, setClusterModalVisible] = useState(false);
  const [clusterMethod, setClusterMethod] = useState('fingerprint');
  const [clusters, setClusters] = useState([]);
  const [selectedClusters, setSelectedClusters] = useState([]);
  const [newValues, setNewValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);

  const handleOperationChange = (column, ops) => {
    setOperations({ ...operations, [column]: ops });
  };

  const handleClusterMethodChange = async (column) => {
    setCurrentColumn(column);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('column', column);
      formData.append('method', clusterMethod);

      const response = await fetch('http://127.0.0.1:8000/refine/cluster/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      const clustersWithKeys = data.clusters.map(cluster => ({
        ...cluster,
        key: shortid.generate(), // Add unique keys
      }));
      setClusters(clustersWithKeys);
      setSelectedClusters([]);
      setNewValues(prevNewValues => { // Use a callback function
        const initialNewValues = {};
        clustersWithKeys.forEach(cluster => {
            initialNewValues[cluster.key] = "";
        });
        return initialNewValues; // Return the new state
    });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefineSubmit = async (column) => {
    setLoading(true);
    setError(null);

    try {
      const ops = operations[column] || [];
      let mergeClustersNeeded = false;
      
      for (const op of ops) {
        if (op === 'merge_clusters') {
          mergeClustersNeeded = true; // Set the flag
          await handleClusterMethodChange(column); // Call this before opening the modal
          break; // Exit the loop; we'll handle merge_clusters separately
        } else {
          const formData = new FormData();
          formData.append('columns', column);

          let endpoint = '';
          switch (op) {
            case 'trim':
              endpoint = '/refine/trim/';
              break;
            case 'fill_blanks':
              endpoint = '/refine/fill_blanks/';
              break;
            case 'remove_duplicates':
              endpoint = '/refine/remove_duplicates/';
              break;
            default:
              continue;
          }

          const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }
        }
      }

      if (mergeClustersNeeded) {
        setClusterModalVisible(true); // Open the modal if merge_clusters was selected
      } else {
        onRefine(); // Call onRefine only if merge_clusters was NOT selected
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMergeClusters = async (column) => {
    if (!column) {
      console.error('Column is undefined');
      return;
    }
    setLoading(true);
    setError(null);
  
    try {
      // Prepare clusters data (flatten the array of arrays)
      const selectedClusterObjects = selectedClusters.map(key => clusters.find(c => c.key === key)); // Get the cluster *objects*
      const selectedClusterData = selectedClusterObjects.map(cluster => cluster.values).flat(); // Extract the values
  
      const newValuesPayload = selectedClusterObjects.map(cluster => {
        const mergedValue = newValues[cluster.key]; // Key by cluster *key* - THE KEY CHANGE!

                if (mergedValue === undefined || mergedValue === "") {
                    throw new Error(`Please provide a merged value for cluster: ${cluster.values.join(", ")}`);
                }
                return mergedValue;
            });
  
      const requestBody = {
        column: column,
        clusters: selectedClusterData, // Flattened clusters
        new_values: newValuesPayload,  // New values format
      };
  
      // Log the data before sending it
      console.log("Form Data before sending:", requestBody);
  
      // Send the request using JSON format instead of FormData
      const response = await fetch('http://127.0.0.1:8000/refine/merge_clusters/', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
  
      // If there's an error message from the backend, display it
      if (data.error) {
        console.error('API Error:', data.error); // Log the error from the backend
        throw new Error(data.error);
      }
  
      setClusterModalVisible(false);
      onRefine(); // Call onRefine after a successful merge
    } catch (err) {
      console.error('Request Error:', err); // Log the request error
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 text-white">
      {error && (
        <Alert message={error} type="error" showIcon />
      )}

      <Collapse className='bg-white'>
        {selectedColumns.map((column) => (
          <Collapse.Panel key={column} header={column}>
            <Space direction="vertical" className="w-full">
              <Checkbox.Group
                options={[
                  { label: 'Trim whitespace', value: 'trim' },
                  { label: 'Fill blank values', value: 'fill_blanks' },
                  { label: 'Remove duplicates', value: 'remove_duplicates' },
                  { label: 'Merge similar values', value: 'merge_clusters' }
                ]}
                value={operations[column] || []}
                onChange={(ops) => handleOperationChange(column, ops)}
              />
              <Button 
                className='text-black'
                onClick={() => handleRefineSubmit(column)}
                disabled={loading}
              >
                {loading ? <Spin /> : <Check />}
                Apply Refinements
              </Button>
            </Space>
          </Collapse.Panel>
        ))}
      </Collapse>

      <Modal
        visible={isClusterModalVisible}
        onCancel={() => setClusterModalVisible(false)}
        title="Merge Similar Values"
        footer={[
          <Button key="cancel" onClick={() => setClusterModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="merge" 
          onClick={() => handleMergeClusters(currentColumn)} 
          disabled={loading}
          >
            {loading ? <Spin /> : 'Merge Selected'}
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <Select
            value={clusterMethod}
            onChange={(value) => setClusterMethod(value)}
            className="w-full"
          >
            <Option value="fingerprint">Fingerprint Matching</Option>
            <Option value="ngram">N-gram Similarity</Option>
          </Select>

          <Table
            dataSource={clusters}
            columns={[
              {
                title: 'Similar Values',
                render: (row) => (
                  <ul className="list-disc pl-4">
                    {row.values.map((val, i) => (
                      <li key={i}>{val}</li>
                    ))}
                  </ul>
                ),
              },
              {
                title: 'Count',
                render: (row) => row.count,
              },
              {
                title: 'New Value',
                    render: (row) => {
                        const clusterKey = clusters.find(c => c.values === row.values)?.key; // Find the associated cluster key
                        return (
                            <Input
                                value={newValues[clusterKey] || ''} // Key by the first value in the cluster
                                onChange={(e) => {
                                    setNewValues({
                                        ...newValues,
                                        [clusterKey]: e.target.value, // Use the same key when setting the value
                                    });
                                }}
                            />
                        );
                    },
                },
            ]}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedClusters,
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedClusters(selectedRowKeys);
                console.log("Selected Rows:", selectedRows);
              },
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RefiningPanel;
