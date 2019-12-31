import React, {PureComponent} from 'react';
import {Upload, Modal, Icon, message, List, Typography, Button, Card} from 'antd';
import {uploadProjectUrl, fileDownload} from '../../services';
const {Dragger} = Upload;

const {Paragraph, Title} = Typography;

export default class ImportModal extends PureComponent {
  state = {
    error_list : [],
    msgLoading: null,
    isShowedTutorial: false
  }

  beforeUpload = () => {
    this.setState({
      msgLoading: message.loading('正在上传', 0)
    });
    return true;
  }

  uploadChange = info => {
    const { status, response } = info.file;
    const {onCancel} = this.props;
    const {msgLoading} = this.state;
    if (status === 'done') {
      msgLoading();
      if (response.data.success) {
        this.setState({
          error_list: []
        });
        message.success('文件上传成功');
        onCancel(true);
      } else {
        message.error('文件导入失败，请重新上传');
        this.setState({
          error_list: response.data.errors
        });
      }
    } else if (status === 'error') {
      msgLoading();
      message.error(`文件上传失败`);
    }
  }
  showTutorial = isShow => {
    this.setState({
      isShowedTutorial: isShow
    })
  }
  fileDownload = fileName => {
    const url = fileDownload({
      fileName
    });
    let ifr = document.getElementById('temp-download-iframe');
    if (ifr) {
      ifr.src = url;
    } else {
      let iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.id = 'temp-download-iframe';
      document.getElementsByTagName('head')[0].appendChild(iframe);
    }
  }
  render() {
    const {onCancel} = this.props;
    const {error_list,isShowedTutorial} = this.state;
    return (
      <Modal
        visible
        title="导入项目"
        footer={null}
        onCancel={() => {onCancel(false)}}
      >
        <Dragger
          accept="application/zip"
          name="file"
          showUploadList={false}
          action={uploadProjectUrl}
          onChange={this.uploadChange}
          beforeUpload={this.beforeUpload}
        >
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">点击或将文件拖拽至此上传</p>
        <p className="ant-upload-hint">仅支持上传单个.zip文件，不大于1M</p>
        </Dragger>
        <Button type="link" onClick={() => {this.showTutorial(true)}}>显示导入教程？</Button>
        {isShowedTutorial && (
          <Card>
            <Title level={3}>导入教程</Title>
            <Paragraph>1. 新建一个文件夹，在文件夹里面新建项目基础信息文件 meta.json，字段包括项目名称 title，接口前缀 prefix，描述 desc，接口列表 items，是这数组。items数组里面每一项包括：接口名称 title，地址 url，请求方式 type。</Paragraph>
            <Paragraph>2. 根据接口地址，按层级方式创建文件夹，在目标文件夹内创建json文件。</Paragraph>
            <Paragraph>3. 将上面的文件连同根文件夹打包并上传。</Paragraph>
            <Paragraph><Button type="link" onClick={() => {this.fileDownload('测试项目.zip')}}>样例下载</Button></Paragraph>
            <Title level={4}>从 Easy Mock 导入？</Title>
            <Paragraph>从 Easy Mock 导出的接口有个问题，就是只有接口文件，没有接口的基础信息，包括名称，url，请求方式。因此这些需要我们自己处理。</Paragraph>
            <Paragraph>1. 复制下面这段代码，在 Easy Mock 项目主页按F12弹窗开发人员工具，打开 console 面板并粘贴，获得一个字符串，复制这个字符串。</Paragraph>
            <div style={{padding: '0 30px',backgroundColor: '#eee',marginBottom: 15,whiteSpace:'pre-wrap'}}>
              {`
  JSON.stringify({
    title: __INITIAL_STATE__.mock.project.name,
    prefix: __INITIAL_STATE__.mock.project.url,
    desc: __INITIAL_STATE__.mock.project.description,
    items: __INITIAL_STATE__.mock.list.map(item => ({
      title: item.description,
      url: item.url,
      type: item.method
    }))
  })
              `}
            </div>
            <Paragraph>2. 下载下面这份代码，在Node项目里面运行。生成 meta.json，剪贴进从 Easy Mock 导出的文件夹，放在接口文件的根目录下，然后把接口文件连根目录打包上传。</Paragraph>
            <Paragraph><Button type="link" onClick={() => {this.fileDownload('meta_generator.js')}}>下载生成文件</Button></Paragraph>
            <div style={{float: 'right'}}>
              <Button type="link" onClick={() => {this.showTutorial(false)}}>关闭</Button>
            </div>
          </Card>
        )}
        {error_list.length ? (
          <List
            header="错误信息"
            bordered
            dataSource={error_list}
            renderItem={(item, index) => (
              <List.Item>
                <Typography.Text>{index + 1}. {item}</Typography.Text>
              </List.Item>
            )}
            style={{marginTop: 20}}
          />
        ) : null}
      </Modal>
    )
  }
}