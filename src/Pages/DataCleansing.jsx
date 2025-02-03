import React, {useEffect, useState} from 'react';
import {Row, Steps, Button, Col, notification, Table, Spin} from 'antd';
import {APP_URL} from "../../config/config";
import axios from "axios";
import {StartRefining} from "./StartRefining";
import {UndoRedo} from "./UndoRedo";
import {Export} from "./Export";
import {clearDuplicateStep, getDuplicateStep, setDuplicateStep} from "../../config/auth-service";

const { Step } = Steps;

export const DataCleansing = ({
                                  projectId = '',
                                  projectName = '',
                                  exportComplete,
                                  keyers = []
                              }) => {

    const [columnData, setColumns] = useState([]);
    const [colReview, setColReview] = useState([]);
    const [rows, setRows] = useState([]);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState({past: [], future: []});
    const [historyLoading, setHistoryLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [selectedTags, setSelectedTags] = useState([]);
    const [operations, setOperations] = useState({});
    const [isMergeClusterModalVisible, setMergeClusterModalVisible] = useState(false);
    const [mergeClusterColumn, setMergeClusterColumn] = useState('');
    const [clusterResults, setClusterResults] = useState([]);
    const [cellValues, setCellValues] = useState({});

    const notify = alertMessage => {
        notification[alertMessage.type]({
            message: alertMessage.message,
            placement: "bottomRight",
            duration: alertMessage.duration ? parseInt(alertMessage.duration) : 5
        });
    };

    const getRowPreview = async (colName, op, type) => {
        const response = await axios.post(`${APP_URL}/app/preview-refine`, {
            projectId: projectId,
            column: colName ? colName : '',
            operation: op ? op : '',
            type: type ? type : 'true'
        }).then(r => r.data).catch(error => error);
        return response;
    };

    const getHistory = async () => {
        const response = await axios.get(`${APP_URL}/app/get-history`, {
            params: {
                projectId: projectId
            }
        }).then(r => r.data).catch(error => error);
        return response;
    };

    const trim = async (tag) => {
        const trimResponse = await axios.post(`${APP_URL}/app/trim`, {
            projectId: projectId,
            tag
        }).then(r => r.data).catch(error => error);
        return trimResponse;
    };

    const fillBlanks = async (tag) => {
        const fillBlanks = await axios.post(`${APP_URL}/app/fill-blank`, {
            projectId: projectId,
            tag
        }).then(r => r.data).catch(error => error);
        return fillBlanks;
    };

    const mergeCluster = async (clusters) => {
        const merge = await axios.post(`${APP_URL}/app/merge-cluster`, {
            projectId: projectId,
            tag: mergeClusterColumn,
            clusters
        }).then(r => r.data).catch(error => error);
        return merge;
    };

    const handleUndo = async (id) => {
        setHistoryLoading(true);
        const undo = await axios.post(`${APP_URL}/app/undo-redo`, {
            projectId: projectId,
            id
        }).then(r => r.data).catch(error => error);
        const historyResponse = await getHistory();
        setHistory(historyResponse.history);
        setHistoryLoading(false);
        return undo;
    };

    const handleExport = async () => {
        const exportData = await axios.post(`${APP_URL}/app/export`, {
            projectId: projectId,
            projectName: projectName,
            type: 'csv'
        }).then(r => r.data).catch(error => error);
        await exportComplete();
        if (exportData && exportData.success) {
            notify({
                type: "success",
                message: "Successfully exported refined data to the designated folder",
                duration: "0"
            });
        } else {
            notify({
                type: "error",
                message: "Serverside error! please refresh and try again",
                duration: "0"
            });
        }
    };

    const removeDuplicate = async (tag, currentStep) => {
        switch(currentStep) {
            case 'removeRow':
                // eslint-disable-next-line no-case-declarations
                const removeRows = await axios.post(`${APP_URL}/app/remove-row`, {
                    projectId: projectId,
                    tag
                }).then(r => r.data).catch(error => error);
                return {
                    code: removeRows.code,
                    notOk: 'removeRow',
                    ok: ''
                };
            case 'blankDown':
                // eslint-disable-next-line no-case-declarations
                const blankDown = await axios.post(`${APP_URL}/app/blank-down`, {
                    projectId: projectId,
                    tag
                }).then(r => r.data).catch(error => error);
                return {
                    code: blankDown.code,
                    notOk: 'blankDown',
                    ok: 'removeRow'
                };
            case 'sortNum':
                // eslint-disable-next-line no-case-declarations
                const sortNum = await axios.post(`${APP_URL}/app/sort-number`, {
                    projectId: projectId,
                    tag
                }).then(r => r.data).catch(error => error);
                return {
                    code: sortNum.code,
                    notOk: 'sortNum',
                    ok: 'blankDown'
                };
            default:
                // eslint-disable-next-line no-case-declarations
                const sort = await axios.post(`${APP_URL}/app/sort-text`, {
                    projectId: projectId,
                    tag
                }).then(r => r.data).catch(error => error);
                return {
                    code: sort.code,
                    notOk: 'sortText',
                    ok: 'sortNum'
                };
        }
    };

    const successNotify = (s, op) => {
        const success = s === 'ok';
        if (success) {
            notify({
                type: "success",
                message: `Successfully performed ${op} operation`,
                duration: "0"
            });
        } else {
            notify({
                type: "error",
                message: `Failed to perform ${op} operation`,
                duration: "0"
            });
        }
    }


    const init = async () => {
        if (projectId) {
            setPreviewLoading(true);
            const rowData = await getRowPreview();
            const colList = rowData.colList;
            colList.unshift('SELECT ALL');
            setColumns(colList);
            if (colList && colList.length > 0) {
                setLoading(false);
            } else {
                setLoading(true);
            }
            setRows(rowData.results);
            setPreviewLoading(false);
            setColReview(rowData.columns);
            setHistoryLoading(true);
            const historyResponse = await getHistory();
            setHistory(historyResponse.history);
            setHistoryLoading(false);
        }
    };

    const handleTagChange = async (tag, checked) => {
        const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
        setSelectedTags(nextSelectedTags);
    };

    const handleKeyingChange = async (keyFn) => {
        const clusterResponse = await axios.post(`${APP_URL}/app/compute-cluster`, {
            projectId: projectId,
            column: mergeClusterColumn,
            keyingFunction: keyFn
        }).then(r => r.data).catch(error => error);
        setClusterResults(clusterResponse.clusters);
        setCellValues(clusterResponse.cellValues);
    };

    const handleOperation = async (tag, operation) => {
        const op = operations
        op[tag] = operation;
        setOperations(op);
        setPreviewLoading(true);
        if (operation.indexOf('Fill Blanks') > -1) {
            const rowData = await getRowPreview(tag, 'Fill Blanks', 'true');
            setRows(rowData.results);
        } else if (operation.indexOf('Remove Duplicate') > -1) {
            const rowData = await getRowPreview(tag, 'Remove Duplicate', 'true');
            setRows(rowData.results);
        } else if (operation.indexOf('Merge Cluster') > -1) {
            setMergeClusterColumn(tag);
            setMergeClusterModalVisible(true);

        }
        setPreviewLoading(false);
    };

    const handleOperationSubmit = async tag => {
        setHistoryLoading(true);
        for (const op of operations[tag]) {
            if (op === 'Trim') {
                const r = await trim(tag);
                successNotify(r.code, op);
                const rowData = await getRowPreview();
                setRows(rowData.results);
            } else if (op === 'Fill Blanks') {
                const r = await fillBlanks(tag);
                successNotify(r.code, op);
                const rowData = await getRowPreview(tag, 'Fill Blanks', 'false');
                setRows(rowData.results);
            } else if (op === 'Remove Duplicate') {
                const currentStep = getDuplicateStep().step ? getDuplicateStep().step : '';
                const dupResponse = await removeDuplicate(tag, currentStep);
                if (dupResponse.code === 'ok') {
                    successNotify('ok', dupResponse['notOk']);
                    setDuplicateStep(dupResponse['ok']);
                    await handleOperationSubmit(tag)
                } else if (dupResponse.code === 'completed') {
                    clearDuplicateStep();
                    successNotify('ok', op);
                } else if (dupResponse.code === 'notOk') {
                    setDuplicateStep(dupResponse['notOk']);
                    successNotify('notOk', dupResponse['notOk']);
                }
                const rowData = await getRowPreview(tag, '', 'false');
                setRows(rowData.results);
            }
        }
        const historyResponse = await getHistory();
        setHistory(historyResponse.history);
        setHistoryLoading(false);
    };

    useEffect( ()=>{
        (async() => {await init();} ) ();
    },[projectId]);

    const steps = ['1', '2', '3'];

    const next = () => {
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const onChangeStep = c => {
        setCurrent(c);
    };

    const handleMergeCluster = async (selectedClusters, cells) => {
        const clusters = [];
        for (const cluster of selectedClusters) {
            clusters.push({
                valuesInCluster: cluster.valuesInCluster,
                cellValue: cells[cluster.index]
            })
        }
        setMergeClusterColumn('')
        setClusterResults([]);
        setCellValues({});
        setMergeClusterModalVisible(false);
        setHistoryLoading(true);
        const r = await mergeCluster(clusters);
        successNotify(r.code, 'Merge Cluster');
        const historyResponse = await getHistory();
        setHistory(historyResponse.history);
        setHistoryLoading(false);

    };

    const handleMergeClusterCancel = () => {
        setMergeClusterColumn('');
        setClusterResults([]);
        setCellValues({});
        setMergeClusterModalVisible(false)
    };

    return (
        <>
            <Row className="dvc-data-cleansing-div">
                <Steps
                    current={current}
                    type="navigation"
                    onChange={onChangeStep}
                    className="site-navigation-steps">
                    <Step title="Start Refining" description="Please select your data refining options from the list available to the column of your choice" />
                    <Step title="Undo / Redo" description="Made any mistakes? No worries! undo / redo your step" />
                    <Step title="Export Data" description="Download your refined data here" />
                </Steps>
                <>
                    {
                        current == 0 &&
                        <Spin spinning={loading}>
                            <StartRefining
                                columns={columnData}
                                selectedTags={selectedTags}
                                handleTagChange={handleTagChange}
                                handleOperation={handleOperation}
                                handleOperationSubmit={handleOperationSubmit}
                                history={history}
                                isMergeClusterModalVisible={isMergeClusterModalVisible}
                                handleMergeCluster={handleMergeCluster}
                                handleMergeClusterCancel={handleMergeClusterCancel}
                                keyers={keyers}
                                handleKeyingChange={handleKeyingChange}
                                clusterResults={clusterResults}
                                cellValues={cellValues}
                                historyLoading={historyLoading}
                            />
                        </Spin>
                    }
                    {
                        current == 1 &&
                        <UndoRedo
                            history={history}
                            handleUndo={handleUndo}
                        />
                    }
                    {
                        current == 2 &&
                        <Export
                            handleExport={handleExport}
                        />
                    }
                    <Row className={"mt-5"}>
                        <Col span={24}>
                            <div className="steps-action">
                                {current > 0 && (
                                    <Button type="primary" style={{ margin: '0 8px' }} onClick={() => prev()}>
                                        Previous
                                    </Button>
                                )}
                                {current < steps.length - 1 && (
                                    <Button type="primary" onClick={() => next()}>
                                        Next
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>
                </>
            </Row>
            <Row className="dvc-preview-refine">
                <Col span={24}>
                    <div>
                        <Table loading={previewLoading} dataSource={rows} columns={colReview} />
                    </div>
                </Col>
            </Row>
        </>
    )

}