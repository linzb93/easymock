import React, {PureComponent} from 'react';
import {Table, Button, message} from 'antd';
import Preview from './Preview';
import {getProjectDetail, getApiPage, deleteApi,exportApi} from '../../services';

export default class List extends PureComponent {
  state = {
    prefix: '',
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
          <Button type="primary" size="small" onClick={() => {this.copy(record.id)}}>复制</Button>
          <Button type="danger" size="small" onClick={() => {this.delete(record.id)}}>删除</Button>
        </div>
      )
    }
  ]
  componentDidMount() {
    const {project_id} = this.props.match.params
    getProjectDetail({
      project_id
    })
    .then(res => {
      const {prefix} = res.data;
      this.setState({
        project_id,
        prefix: `${project_id}${prefix}`
      }, () => {
        this.fetchList();
      })
    });
  }
  fetchList = () => {
    const {project_id} = this.state;
    getApiPage({
      project_id
    })
    .then(res => {
      this.setState({
        data: res.data
      })
    })
  }
  add = () => {
    const {project_id} = this.state;
    const {history} = this.props;
    history.push(`/project/${project_id}/create`);
  };
  edit = id => {
    const {project_id} = this.state;
    const {history} = this.props;
    history.push(`/project/${project_id}/update/${id}`);
  }
  delete = id => {
    const {project_id} = this.state;
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
  export = () => {
    const {project_id} = this.state;
    const url = exportApi({
      project_id
    });
    let ifr = document.getElementById('temp-download-iframe');
    if (ifr) {
      ifr.src = url;
      // ifr.reload();
    } else {
      let iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.id = 'temp-download-iframe';
      document.getElementsByTagName('head')[0].appendChild(iframe);
    }
    // .then(() => {
    //   message.success('下载成功');
    // })
  }
  render() {
    const {
      data,
      isShowPreviewModal,
      project_id,
      api_id,
      fetch_type,
      prefix
    } = this.state;
    return (
      <div className="wrapper">
        <div className="table-filter">
          <p>接口前缀：/mock/{prefix}</p>
          <Button type="primary" onClick={this.add}>添加接口</Button>
          <Button type="primary" onClick={this.export}>导出接口</Button>
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