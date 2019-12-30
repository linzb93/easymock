import React, {PureComponent} from 'react';
import {Upload, Modal, Icon, message, List, Typography} from 'antd';
import {uploadProjectUrl} from '../../services';
const {Dragger} = Upload;

export default class ImportModal extends PureComponent {
  state = {
    error_list : []
  }
  uploadChange = info => {
    const { status, response } = info.file;
    let hideLoading;
    if (status !== 'uploading') {
      hideLoading = message.loading('文件正在上传', 0);
    }
    if (status === 'done') {
      hideLoading();
      message.success('文件上传成功');
      if (response.data.success) {
        this.setState({
          error_list: []
        });
      } else {
        this.setState({
          error_list: response.data.errors
        });
      }
    } else if (status === 'error') {
      hideLoading();
      message.error(`文件上传失败`);
    }
  }
  render() {
    const {onCancel} = this.props;
    const {error_list} = this.state;
    return (
      <Modal
        visible
        title="导入项目"
        footer={null}
        onCancel={onCancel}
      >
        <Dragger
          accept="application/zip"
          name="file"
          showUploadList={false}
          action={uploadProjectUrl}
          onChange={this.uploadChange}
        >
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">点击或将文件拖拽至此上传</p>
        <p className="ant-upload-hint">仅支持上传单个.zip文件，不大于1M</p>
        </Dragger>
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