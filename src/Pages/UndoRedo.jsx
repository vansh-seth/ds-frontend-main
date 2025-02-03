import React from 'react';
import { Button, Row, Col, List, Divider, Typography} from 'antd';
import { RedoOutlined} from '@ant-design/icons';
import moment from "moment";


export const UndoRedo = ({
                             history = {past: [], future: []},
                             handleUndo
                         }) => {

    return (
        <>
            <Row className="mt-20 mbp-10" style={{ width: '100%'}}>
                <Col span={15}>
                    <Divider orientation="left">History</Divider>
                    {
                        history.past && history.past.length > 0 &&
                        <List
                            header={<div>Past</div>}
                            bordered
                            dataSource={history.past}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Button type={"primary"} onClick={() => handleUndo(item.id)} key={item.id} icon={<RedoOutlined />}/>]}
                                >
                                    <Typography.Text mark>{moment(item.time).format('LLL')}</Typography.Text> {item.description}
                                </List.Item>
                            )}
                        />
                    }
                    {
                        history.future && history.future.length > 0 &&
                        <List
                            header={<div>Future</div>}
                            bordered
                            dataSource={history.future}
                            renderItem={item => (
                                <List.Item
                                    actions={[<Button type={"primary"} onClick={() => handleUndo(item.id)} key={item.id} icon={<RedoOutlined />}/>]}
                                >
                                    <Typography.Text mark>{moment(item.time).format('LLL')}</Typography.Text> {item.description}
                                </List.Item>
                            )}
                        />
                    }
                </Col>
            </Row>

        </>
    )

}