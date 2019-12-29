import React, {PureComponent} from 'react';
import CreateModal from './Create';
import ImportModal from './Import';
import {Table, Button, message} from 'antd';
import {Link} from 'react-router-dom';
import {getProjectList, deleteProject} from '../../services';

export default class Index extends PureComponent {
  state = {
    data: [],
    isShowCreateModal: false,
    isShowImportModal: false,
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
  cancelModal = (name, reloaded) => {
    this.setState({
      [name]: false
    });
    if (reloaded) {
      this.getProjectList();
    }
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
    .then(() => {
      message.success('删除成功');
      this.getProjectList();
    })
  }
  import = () => {
    this.setState({
      isShowImportModal: true
    });
  }
  render() {
    const {data, isShowCreateModal, isShowImportModal, project_id} = this.state;
    return (
      <div className="wrapper">
        <div className="table-filter">
          <Button type="primary" onClick={this.add}>添加项目</Button>
          <Button type="primary" onClick={this.import}>导入项目</Button>
        </div>
        <Table
          columns={this.columns}
          dataSource={data}
          rowKey="project_id"
          bordered
        />
        {isShowCreateModal && (
          <CreateModal
            onCancel={reloaded => {this.cancelModal('isShowCreateModal', reloaded)}}
            project_id={project_id}
          />
        )}
        {isShowImportModal && (
          <ImportModal
            onCancel={() => {this.cancelModal('isShowImportModal', true)}}
          />
        )}
      </div>
    )
  }
}