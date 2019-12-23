import React, {PureComponent} from 'react';
import {Button, Select, message, Form, Input, Row, Col, Card} from 'antd';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";
import {createApi, updateApi, getApiDetail} from '../../services';
import './Api.css';

const FormItem = Form.Item;
const {Option} = Select;
const typeList = ['get','post', 'delete', 'put', 'patch'];

class Editor extends PureComponent {
  state = {
    data: {}
  }
  componentDidMount() {
    this.setState({
      project_id: this.props.match.params.project_id,
      api_id: this.props.match.params.api_id
    }, () => {
      const {api_id, project_id} = this.state;
      if (api_id) {
        getApiDetail({
          project_id,
          api_id
        })
        .then(res => {
          this.setState({
            data: res.data
          })
        })
      }
    });
  }
  changeCode = val => {
    this.setState(prevState => ({
      data: {
        ...prevState.data,
        code: val
      }
    }))
  }
  submit = () => {
    const {form: {validateFields}} = this.props;
    const {project_id, api_id, data} = this.state;
    validateFields((err, values) => {
      if (err) {
        return;
      }
      if (!data.code) {
        message.error('请输入代码');
        return;
      }
      if (!api_id) {
        createApi({
          project_id,
          ...values,
          code: data.code
        })
        .then(() => {
          message.success('添加成功');
          this.back();
        })
      } else {
        updateApi({
          project_id,
          api_id,
          ...values,
          code: data.code
        })
        .then(() => {
          message.success('编辑成功');
          this.back();
        })
      }
    });
  }
  back = () => {
    const {history} = this.props;
    history.goBack();
  }
  render() {
    const {form: {getFieldDecorator}} = this.props;
    const {data} = this.state;
    return (
      <div className="wrapper full-height">
        <div className="left-config">
          <Card className="config-form-wrapper">
            <Form>
              <FormItem label="名称">
                {getFieldDecorator('title', {
                  rules: [
                    {
                      required: true,
                      message: '请输入标题'
                    }
                  ],
                  initialValue: data.title
                })(
                  <Input placeholder="请输入标题" />
                )}
              </FormItem>
              <FormItem label="方式">
                {getFieldDecorator('type', {
                  initialValue: data.type || 'get'
                })(
                  <Select placeholder="请选择请求方式">
                    {typeList.map(item => (
                      <Option value={item} key={item}>{item}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              <FormItem label="地址">
                {getFieldDecorator('url', {
                  rules: [
                    {
                      required: true,
                      message: '请输入地址'
                    }
                  ],
                  initialValue: data.url
                })(
                  <Input placeholder="请输入地址" />
                )}
              </FormItem>
              <Row>
                <Col span={11}>
                  <Button type="primary" block onClick={this.submit}>保存</Button>
                </Col>
                <Col span={11} offset={2}>
                  <Button block onClick={this.back}>取消</Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
        <div className="code-con">
          <AceEditor
            mode="json"
            theme="monokai"
            fontSize={16}
            width="100%"
            height="100%"
            wrapEnabled={true}
            showPrintMargin={false}
            setOptions={{
              tabSize: 2
            }}
            value={data.code}
            onChange={this.changeCode}
          />
        </div>
      </div>
    )
  }
}

export default Form.create()(Editor);