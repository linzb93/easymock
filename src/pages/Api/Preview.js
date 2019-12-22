import React, {PureComponent} from 'react';
import {Modal} from 'antd';
import {getApiPreview} from '../../services';

export default class Preview extends PureComponent {
  state = {
    data: ''
  };
  componentDidMount() {
    const {project_id, api_id, type} = this.props;
    getApiPreview({
      project_id,
      api_id,
      type
    })
    .then(res => {
      this.setState({
        data: JSON.stringify(res.data, null, 4)
      })
    })
  }
  render() {
    const {onCancel} = this.props;
    const {data} = this.state;
    return (
      <Modal
        title="接口预览"
        visible
        footer={null}
        onCancel={onCancel}
      >
        <div style={{whiteSpace: 'pre-wrap'}}>{data}</div>
      </Modal>
    )
  }
}