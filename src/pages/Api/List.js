import React, {PureComponent} from 'react';
import {Table, Button, message} from 'antd';
import Preview from './Preview';
import {getApiPage, deleteApi} from '../../services';

export default class List extends PureComponent {
  state = {
    data: [],
    isShowPreviewModal: false,
    project_id: '',
    api_id: '',
    fetch_type: ''
  }
  columns = [
    {
      title: '名称',
      dataIndex: 'title'
    },
    {
      title: '地址',
      dataIndex: 'url'
    },
    {
      title: '操作',
      render: (_, record) => (
        <div className="table-opr-wrap">
          <Button type="primary" size="small" onClick={() => {this.edit(record.id)}}>编辑</Button>
          <Button type="primary" size="small" onClick={() => {this.preview(record.id, record.type)}}>预览</Button>
          <Button type="primary" size="small" onClick={() => {this.copy(record.project_id)}}>复制</Button>
          <Button type="danger" size="small" onClick={() => {this.delete(record.id)}}>删除</Button>
        </div>
      )
    }
  ]
  componentDidMount() {
    this.fetchList();
  }
  fetchList = () => {
    getApiPage({
      project_id: this.props.match.params.project_id
    })
    .then(res => {
      this.setState({
        data: res.data
      })
    })
  }
  add = () => {
    const {match, history} = this.props;
    const {project_id} = match.params;
    history.push(`/project/${project_id}/create`);
  };
  edit = id => {
    const {match, history} = this.props;
    const {project_id} = match.params;
    history.push(`/project/${project_id}/update/${id}`);
  }
  delete = id => {
    const {match} = this.props;
    const {project_id} = match.params;
    deleteApi({
      project_id,
      api_id: id
    })
    .then(() => {
      message.success('删除成功');
      this.fetchList();
    })
  }
  preview = (api_id, type) => {
    this.setState({
      isShowPreviewModal: true,
      api_id,
      fetch_type: type
    })
  }
  render() {
    const {data, isShowPreviewModal, api_id, fetch_type} = this.state;
    const {match} = this.props;
    const project_id = match.params.project_id;
    return (
      <div className="wrapper">
        <div className="table-filter">
          <Button type="primary" onClick={this.add}>添加接口</Button>
        </div>
        <Table
          dataSource={data}
          columns={this.columns}
          rowKey="api_id"
          bordered
        />
        {isShowPreviewModal && (
          <Preview
            project_id={project_id}
            api_id={api_id}
            type={fetch_type}
            onCancel={() => {this.setState({isShowPreviewModal: false})}}
          />
        )}
      </div>
    )
  }
}