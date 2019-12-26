import React, {PureComponent} from 'react';
import {Upload, Modal, Icon, message} from 'antd';
import {uploadProjectUrl} from '../../services';
const {Dragger} = Upload;

export default class ImportModal extends PureComponent {
  uploadChange = info => {
    const { status } = info.file;
    let hideLoading;
    if (status !== 'uploading') {
      hideLoading = message.loading('文件正在上传', 0);
    }
    if (status === 'done') {
      hideLoading();
      message.success('文件上传成功');
    } else if (status === 'error') {
      hideLoading();
      message.error(`文件上传失败`);
    }
  }
  render() {
    const {onCancel} = this.props;
    return (
      <Modal
        visible
        title="导入项目"
        showUploadList={false}
        footer={null}
        onCancel={onCancel}
      >
        <Dragger
          accept="application/zip"
          name="file"
          action={uploadProjectUrl}
          onChange={this.uploadChange}
        >
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">点击或将文件拖拽至此上传</p>
        <p className="ant-upload-hint">仅支持上传单个.zip文件</p>
        </Dragger>
      </Modal>
    )
  }
}