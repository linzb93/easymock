import React, {PureComponent} from 'react';
import CreateModal from './Create';
import {Table, Button, message} from 'antd';
import {Link} from 'react-router-dom';
import {getProjectList, deleteProject} from '../../services';

export default class Index extends PureComponent {
  state = {
    data: [],
    isShowCreateModal: false,
    project_id: ''
  }
  columns = [
    {
      title: '名称',
      dataIndex: 'title',
      render: (text, record) => (
      <Link to={`/project/${record.project_id}`}>{text}</Link>
      )
    },
    {
      title: '操作',
      render: (text, record) => (
        <div className="table-opr-wrap">
          <Button type="primary" size="small" onClick={() => {this.edit(record.project_id)}}>编辑</Button>
          <Button type="danger" size="small" onClick={() => {this.delete(record.project_id)}}>删除</Button>
        </div>
      )
    }
  ]

  componentDidMount() {
    this.getProjectList();
  }

  add = () => {
    this.setState({
      isShowCreateModal: true
    })
  }

  getProjectList = () => {
    getProjectList()
    .then(res => {
      this.setState({
        data: res.data
      })
    })
  }
  cancelModal = () => {
    this.setState({
      isShowCreateModal: false
    });
    this.getProjectList();
  }
  edit = project_id => {
    this.setState({
      isShowCreateModal: true,
      project_id
    })
  }
  delete = project_id => {
    deleteProject({
      project_id
    })
    .then(res => {
      message.success('删除成功');
      this.getProjectList();
    })
  }
  
  render() {
    const {data, isShowCreateModal, project_id} = this.state;
    return (
      <div className="wrapper">
        <div className="table-filter">
          <Button type="primary" onClick={this.add}>添加项目</Button>
        </div>
        <Table
          columns={this.columns}
          dataSource={data}
          rowKey="project_id"
          bordered
        />
        {isShowCreateModal && (
          <CreateModal
            onCancel={this.cancelModal}
            project_id={project_id}
          />
        )}
      </div>
    )
  }
}