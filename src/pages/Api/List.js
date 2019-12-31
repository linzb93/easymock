import React, {PureComponent} from 'react';
import {Table, Button, message, Typography, Tag} from 'antd';
import copy from 'copy-to-clipboard';
import Preview from './Preview';
import {getProjectDetail, getApiPage, deleteApi,exportApi, cloneApi} from '../../services';

const {Text, Paragraph, Title} = Typography;

function TypeTag({type}) {
  const typeMap = {
    get: 'blue',
    post: 'green',
    delete: 'red',
    patch: 'purple',
    put: 'cyan'
  };
  return <Tag color={typeMap[type]}>{type}</Tag>
}

export default class List extends PureComponent {
  state = {
    meta: {},
    data: {
      list:[],
      total: 0
    },
    pagination: {
      size: 10,
      current: 1
    },
    isShowPreviewModal: false,
    project_id: '',
    api_id: '',
    fetch_type: ''
  }
  columns = [
    {
      title: '名称',
      dataIndex: 'title',
      width: '25%'
    },
    {
      title: '地址',
      dataIndex: 'url',
      width: '25%'
    },
    {
      title: '方法',
      dataIndex: 'type',
      render: text => <TypeTag type={text} />,
      width: '10%'
    },
    {
      title: '操作',
      render: (_, record) => (
        <div className="table-opr-wrap">
          <Button type="primary" size="small" onClick={() => {this.edit(record.id)}}>编辑</Button>
          <Button type="primary" size="small" onClick={() => {this.preview(record.id, record.type)}}>预览</Button>
          <Button type="primary" size="small" onClick={() => {this.clone(record.id)}}>克隆</Button>
          <Button type="primary" size="small" onClick={() => {this.copyToClipboard(record.url)}}>复制接口地址</Button>
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
      this.setState({
        project_id,
        meta: {
          ...res.data,
          prefix: `${project_id}${res.data.prefix}`
        }
      }, () => {
        this.fetchList();
      })
    });
  }
  fetchList = () => {
    const {project_id, pagination: {current, size}} = this.state;
    getApiPage({
      project_id,
      page: current,
      size
    })
    .then(res => {
      this.setState({
        data: res.data
      })
    })
  }
  changePaginationCurrent = current => {
    this.setState(prevState => ({
      pagination: {
        ...prevState.pagination,
        current
      }
    }), () => {
      this.fetchList();
    });
  }
  copyToClipboard = url => {
    const {meta} = this.state;
    copy(`${window.location.hostname}:4000/mock/${meta.prefix}${url}`);
    message.success('接口复制成功');
    
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
    // openVscode({
    //   project_id,
    //   api_id: id
    // })
    // .then(res => {
    //   message.success(res.message);
    // });
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
  clone = api_id => {
    const {project_id} = this.state;
    cloneApi({
      project_id,
      api_id
    })
    .then(() => {
      message.success('复制成功');
      this.fetchList();
    });
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
      meta,
      pagination
    } = this.state;
    return (
      <div className="wrapper">
        <Title style={{marginTop: 20}}>{meta.title}</Title>
        <Paragraph>接口前缀：<Text copyable>{`${window.location.hostname}:4000/mock/${meta.prefix}`}</Text></Paragraph>
        <Paragraph>项目id：{project_id}</Paragraph>
        <div className="table-filter">
          <Button type="primary" onClick={this.add}>添加接口</Button>
          <Button type="primary" onClick={this.export}>导出接口</Button>
        </div>
        <Table
          dataSource={data.list}
          columns={this.columns}
          rowKey="api_id"
          pagination={{
            total: data.total,
            showTotal: total => `共有 ${total} 条记录`,
            pageSize: pagination.size,
            onChange: this.changePaginationCurrent,
            current: pagination.current,
            defaultCurrent: pagination.current,
          }}
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