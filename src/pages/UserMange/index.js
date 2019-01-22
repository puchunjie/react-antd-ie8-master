import React, { Component } from "react";
import './style.less'
import { DatePicker, Button, Icon, Spin, Calendar, Select, Table, Modal,Upload, message,Form, Input } from "antd";
import { $post, getCookie } from "../../utils/auth";
const Option = Select.Option;
const confirm = Modal.confirm;
const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;

class UserMange extends Component {
    state = {
        list: [], 
		loading: false,
		options: [],
		params: {
			page: 1,
			pageSize: 10,
            userName: '',
            atdUserType: '',
		},
		total: 0
    }

    cols = data => {
		let _this = this;
		return [{
			key: "1",
			dataIndex: 'userName',
			title: "姓名"
		},{
			key: "2",
			dataIndex: 'post',
			title: "职位"
		},{
			key: "3",
			dataIndex: 'phone',
			title: "手机"
		},{
			key: "4",
			dataIndex: 'email',
			title: "邮箱",
		},{
			key: "5",
			dataIndex: 'sex',
			title: "性别"
        }]
	}


	//分页信息
	pagination = (total,params) => {
		let _this = this;
		return {
			pageSize: params.pageSize,
			defaultCurrent: params.page,
			total: total,
			onChange(current) {
				let data = Object.assign({}, params, { page: current })
				_this.setState({
					params: data
				})
				_this.getUsers();
			}
		}
	};

    getUsers = () => {
        let params = JSON.parse(JSON.stringify(this.state.params));
        this.setState({
			loading: true
		});
        $post('/paiban/api/user/v1/search',params).done(res => {
			if(res.status == 200){
                let data = res.body ? res.body.records : [];
                data = data.map(item => {
                    return {
                        sex: item.gender == 1 ? '女' : '男',
                        ...item
                    }
                })
				this.setState({
					total: res.body.total,
					list: data
				})
			}
		}).always(e => this.setState({
			loading: false
		}));
    }

    //选择计划归属
	handleChange = (value) => {
		let params = Object.assign({}, this.state.params, { atdUserType: value })
		this.setState({ params });
    }
    
    //输入框搜索
	nameChange = e => {
		let params = Object.assign({}, this.state.params, { userName: e.target.value })
		this.setState({params})
	}

    componentDidMount(){
        this.getUsers();
    }

    render(){
        const { list, loading } = this.state;
        const props = {
            name: 'file',
            action: '/paiban/api/user/v1/import',
            headers: {
              token: getCookie('AUTH_TOKEN_KEY'),
            },
            onChange:(info) => {
              if (info.file.status === 'done') {    
                  if(info.file.response.status == 200){
                    message.success(`${info.file.name} 上传成功。`);
                    this.getUsers();
                  }else{
                    message.error(`${info.file.name} 上传失败。${info.file.response.msg}`);
                  }
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 上传失败。`);
              }
            }
          }

        
        return <Spin spinning={ loading}>
        <div className="dutyschedule-container">
            <Upload {...props} className="up-load">
                <Button type="ghost">
                <Icon type="upload" /> 导入员工
                </Button>
            </Upload>
            <Form inline onSubmit={this.search}>
                <FormItem label="职位">
                    <Select value={ this.state.params.atdUserType } style={{ width: 100 }} onSelect={this.handleChange}>
                        <Option key="" value="">全部</Option>
                        <Option key="100" value="100">领导</Option>
                        <Option key="101" value="101">干部</Option>
                    </Select>
                </FormItem>
                <FormItem label="姓名">
                    <Input placeholder="员工姓名" onChange={this.nameChange} value={this.state.params.userName} />
                </FormItem>
                <Button type="primary" onClick={this.getUsers} htmlType="submit">查询</Button>
            </Form>
            <Table style={{ marginTop: 20 }} rowKey='planId' bordered dataSource={list} columns={this.cols(list)} 
            pagination={this.pagination(this.state.total,this.state.params)} />
        </div>
        </Spin>;
    }
}

export default UserMange