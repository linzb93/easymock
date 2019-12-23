import React, {PureComponent} from 'react';
import {Form, Modal, Button, Input, message} from 'antd';
import {createProject, getProjectDetail, updateProject} from '../../services';

const FormItem = Form.Item;

class CreateModal extends PureComponent {
  state = {
    data: {}
  }
  componentDidMount() {
    const {project_id} = this.props;
    if (project_id) {
      getProjectDetail({
        project_id
      })
      .then(res => {
        this.setState({
          data: res.data
        })
      })
    }
  }
  add = () => {
    const {project_id, form: {validateFields}} = this.props;
    validateFields((err,values) => {
      if (err) {
        return;
      }
      if (project_id) {
        updateProject({
          ...values,
          project_id
        })
        .then(() => {
          message.success('修改成功');
          this.onCancel();
        })
      } else {
        createProject(values)
        .then(() => {
          message.success('添加成功');
          this.onCancel();
        })
      }
    })
  }
  onCancel = () => {
    const {onCancel} = this.props;
    if (typeof onCancel === 'function') {
      onCancel();
    }
  }
  render() {
    const {form: {getFieldDecorator}, project_id} = this.props;
    const {data} = this.state;
    const preTitle = project_id ? '修改' : '添加';
    return (
      <Modal
        title={`${preTitle}项目`}
        visible
        onCancel={this.onCancel}
        footer={[
          <Button type="primary" onClick={this.add}>{preTitle}</Button>,
          <Button onClick={this.onCancel}>取消</Button>
        ]}
      >
        <Form>
          <FormItem label="标题">
            {getFieldDecorator('title', {
              rules: [
                {
                  required: true,
                  message: '请输入标题'
                }
              ],
              initialValue: data.title || undefined
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="前缀">
            {getFieldDecorator('prefix', {
              initialValue: data.prefix || undefined
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="简介">
            {getFieldDecorator('desc', {
              initialValue: data.desc || undefined
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

export default Form.create()(CreateModal);