(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[3],{A8du:function(e,a,t){"use strict";t.r(a);t("D3Ud");var n=t("3sgo"),r=(t("igo5"),t("iz8W")),l=(t("Iz1T"),t("sVwd")),s=(t("R8OK"),t("D6w9")),o=(t("kIqu"),t("8X3C")),i=(t("tQxi"),t("noUP")),c=t("2w0b"),p=t.n(c),u=t("rA3V"),m=t.n(u),d=t("svyS"),g=t("4E9k"),w=t.n(g),b=t("i9FS"),E=t.n(b),y=i["a"].Item,f={labelCol:{span:4},wrapperCol:{span:20}},h=e=>{var a=e.form,t=a.validateFields,c=a.getFieldDecorator,u=Object(d["d"])();function g(e){e.preventDefault(),t((e,a)=>{e||u({type:"user/login",payload:a}).then(e=>{2===e.code?o["a"].confirm({title:"\u63d0\u793a",content:"\u8d26\u53f7\u4e0d\u5b58\u5728\uff0c\u662f\u5426\u6ce8\u518c\u4e00\u4e2a\u65b0\u8d26\u53f7\uff1f",onOk:()=>{b(a)}}):1===e.code?s["a"].error("\u5bc6\u7801\u9519\u8bef"):(w.a.set("token",e.token),m.a.push("/"),s["a"].success("\u767b\u5f55\u6210\u529f"))})})}function b(e){u({type:"user/register",payload:e}).then(e=>{w.a.set("token",e.token),m.a.push("/"),s["a"].success("\u6ce8\u518c\u6210\u529f")})}return p.a.createElement("div",{className:"wrapper full-height"},p.a.createElement("div",{className:E.a["login-wrapper"]},p.a.createElement("div",{className:E.a["login-box"]},p.a.createElement(l["a"],{title:"\u767b\u5f55",style:{width:"100%"}},p.a.createElement(i["a"],Object.assign({onSubmit:g},f),p.a.createElement(y,{label:"\u7528\u6237\u540d"},c("name",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u7528\u6237\u540d"}]})(p.a.createElement(r["a"],null))),p.a.createElement(y,{label:"\u5bc6\u7801"},c("password",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u5bc6\u7801"}]})(p.a.createElement(r["a"].Password,null))),p.a.createElement("div",{style:{textAlign:"center"}},p.a.createElement(n["a"],{type:"primary",htmlType:"submit"},"\u767b\u5f55")))))))};a["default"]=i["a"].create()(h)},i9FS:function(e,a,t){e.exports={"login-wrapper":"login-wrapper___139HO","login-box":"login-box___3mgPx"}}}]);