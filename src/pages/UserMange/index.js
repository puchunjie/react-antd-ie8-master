import React, { Component } from "react";
import './style.less'
import { DatePicker, Button, Icon, Spin, Calendar, Select, Table, Modal,Upload, message,Form, Input, Radio, Popover } from "antd";
import { $get, $post, getCookie } from "../../utils/auth";
import { NAMES } from '../../utils/configs'
const Option = Select.Option;
const confirm = Modal.confirm;
const FormItem = Form.Item;
const RadioGroup = Radio.RadioGroup;
const MonthPicker = DatePicker.MonthPicker;

class UserMange extends Component {
    state = {
        NAMES: NAMES,
        list: [], 
		loading: false,
		options: [],
		params: {
			page: 1,
			pageSize: 10,
            userName: '',
            atdUserType: '',
		},
        total: 0,
        depList: [], //部门列表
        isEdit: false,
        visible: false,
        userParams: {
            loginName: '',
            userName: '',
            atdUserType: '100',
            email: '',
            phone: '',
            gender: '0',
            dept: {
                deptId: null,
                name: ''
            }
        },
        popShow: false,
        loading: false,
        leaderNum: 0,
        employeeNum: 0
    }

    //表头
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
        },{
			key: "6",
            title: "操作",
            render: (text, record) => (
                <span>
                    <a onClick={ this.editUser.bind(this,record) }>编辑</a>  
                    <span>  |  </span>  
                    <a onClick={ this.deleteUser.bind(this,record) }>删除</a>
                    <span>  |  </span>  
                    <a onClick={ this.resetPassword.bind(this,record) }>重置密码</a>
                </span>
              )
        }]
    }

    //重置密码
    resetPassword = item => {
        confirm({
			title: '提示',
			content: '您是否确认要重置该用户的登录密码?',
			onOk:() => {
				$post(`/paiban/api/user/v1/resetPwd`,{
                    userId: item.userId
                }).done(res => {
					if(res.status == 200){
						message.success('已重置');
					}else{
						message.error(res.msg);
					}
				})
			}
		});
    }

    //编辑用户
    editUser = item => {
        this.getDepList();
        let userParams = Object.assign({}, this.state.userParams, {
            userId: item.userId,
            loginName: item.loginName,
            userName: item.userName,
            atdUserType: String(item.atdUserType),
            email: item.email,
            phone: item.phone,
            gender: String(item.gender),
            dept: {
                ...item.dept
            }
        })
        this.setState({
            userParams,
            isEdit: true,
            visible: true
        })
    }
    
    //删除员工
    deleteUser = item => {
		confirm({
			title: '提示',
			content: '您是否确认要删除?',
			onOk:() => {
				$post(`/paiban/api/user/v1/del?userId=${item.userId}`).done(res => {
					if(res.status == 200){
						if(this.state.list.length <= 1 && _this.state.params.page > 1){
							let params = Object.assign({}, this.state.params, { page: this.state.params.page - 1 })
							this.setState({
								params: params
							})
						}
						message.success('已删除');
						this.getUsers();
					}else{
						message.error(res.msg);
					}
				})
			}
		});
		
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
        
        $post('/paiban/api/user/v1/userNum').done(res => {
			if(res.status == 200){
				this.setState({
					leaderNum: res.body.leaderNum,
					employeeNum: res.body.employeeNum
				})
			}
		}).always(e => this.setState({
			loading: false
        }));
    }

    //获取部门列表
    getDepList = () => {
        $get('/paiban/api/sys/dept/v1/list').done(res => {
			if(res.status == 200){
                this.setState({
                    depList: res.body || []
                })
			}
		})
    }

    //新增员工
    addNew = () => {
        this.getDepList();
        this.setState({
            isEdit: false,
            visible: true
        })
    }

    resetForm = () => {
        let userParams = Object.assign({}, this.state.userParams, { 
            loginName: '',
            userName: '',
            atdUserType: '100',
            email: '',
            phone: '',
            gender: '0',
            dept: {
                deptId: null,
                name: ''
            }
         })
		this.setState({ userParams });
    }

    //选择计划归属
	handleChange = (value) => {
		let params = Object.assign({}, this.state.params, { atdUserType: value })
		this.setState({ params });
    }

    //选择用户类型
    handleChangeUserType = (value) => {
		let userParams = Object.assign({}, this.state.userParams, { atdUserType: value })
		this.setState({ userParams });
    }

    //选择性别
    handleChangegender = (value) => {
        let userParams = Object.assign({}, this.state.userParams, { gender: value })
		this.setState({ userParams });
    }
    
    //输入框搜索
	nameChange = e => {
		let params = Object.assign({}, this.state.params, { userName: e.target.value })
		this.setState({params})
    }
    
    handlePopChange = (popShow) => {
        this.setState({
            popShow
        });
    }

    showChoise = (item) => {
        let userParams = Object.assign({}, this.state.userParams, { dept: {
            deptId: item.deptId,
            name: item.name
        } })
        this.setState({
            popShow: false,
            userParams
        });
    }

    asyncLoginName = e => {
        let userParams = Object.assign({}, this.state.userParams, { loginName: e.target.value })
        this.setState({ userParams });
    }

    asyncUserName = e => {
        let userParams = Object.assign({}, this.state.userParams, { userName: e.target.value })
        this.setState({ userParams });
    }

    asyncEmail= e => {
        let userParams = Object.assign({}, this.state.userParams, { email: e.target.value })
        this.setState({ userParams });
    }

    asyncPhone = e => {
        let userParams = Object.assign({}, this.state.userParams, { phone: e.target.value })
        this.setState({ userParams });
    }

    asyncDepName = e => {
        let userParams = Object.assign({}, this.state.userParams, { dept: {
            name: e.target.value,
            deptId: this.state.userParams.dept.deptId
        } })
        this.setState({ userParams });
    }

    cancelForm = () => {
        this.setState({ visible: false });
        this.resetForm()
    }

    submitForm = () => {
        let p = this.state.userParams;
        let ok = this.state.isEdit ? p.loginName !== '' && p.userName !== '' : p.loginName !== '' && p.userName !== '' && p.dept.name !== ''; 
        if (ok) {
            this.setState({
                loading: true
            })
            let params = JSON.parse(JSON.stringify(this.state.userParams));
            if(!this.state.depList.some(item => item.name == params.dept.name)){
                params.dept.deptId = '';
            }
            let url = this.state.isEdit ? `/paiban/api/user/v1/update` : `/paiban/api/user/v1/add`
            $post(url, params).done(res => {
                if (res.status == 200) {
                    message.success(this.state.isEdit ? '已修改' : '已添加');
                    this.getUsers();
                    this.cancelForm();
                } else {
                    message.error('请将信息维护完整');
                }
            }).always(() => {
                this.setState({
                    loading: false
                })
            })
        } else {
            message.warning('请将信息维护完整');
        }
        
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
        
        const menu = () => {
            return <div>
                    {
                        this.state.depList.map(dep => <a key={dep.deptId} style={ { display:'block'}} onClick={this.showChoise.bind(this,dep)}>{dep.name}</a>)
                    }
                </div>
        }
        
        return <Spin spinning={ loading}>
        <div className="dutyschedule-container">
            <Button type="ghost" className="add-btn" onClick={ this.addNew }>
                <Icon type="plus" /> 新增员工
            </Button>
            <Upload {...props} className="up-load">
                <Button type="ghost">
                <Icon type="upload" /> 导入员工
                </Button>
            </Upload>
            <Form inline onSubmit={this.search}>
                <FormItem label="职位">
                    <Select value={ this.state.params.atdUserType } style={{ width: 100 }} onSelect={this.handleChange}>
                        <Option key="" value="">全部</Option>
                        <Option key="100" value="100">{ this.state.NAMES.leader }</Option>
                        <Option key="101" value="101">{ this.state.NAMES.staff }</Option>
                    </Select>
                </FormItem>
                <FormItem label="姓名">
                    <Input placeholder="员工姓名" onChange={this.nameChange} value={this.state.params.userName} />
                </FormItem>
                <Button type="primary" onClick={this.getUsers} htmlType="submit">查询</Button>
            </Form>
            <div style={{marginTop:20}}>{ this.state.NAMES.leader }： {this.state.leaderNum}人，  { this.state.NAMES.staff }： {this.state.employeeNum}人</div>
            <Table style={{ marginTop: 20 }} rowKey='planId' bordered dataSource={list} columns={this.cols(list)} 
            pagination={this.pagination(this.state.total,this.state.params)} />
        </div>

        <Modal title={this.state.isEdit ? '编辑员工信息' : '新增员工'} visible={this.state.visible} closable={false}
        footer={[
            <Button key="back" type="ghost" size="large" onClick={this.cancelForm}>返 回</Button>,
            <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={this.submitForm}>
              { this.state.isEdit ? '保 存' : '提 交' }
            </Button>,
          ]}>
            <Form horizontal>
                <FormItem label="登录名" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    <Input placeholder="请输入登录名" value={ this.state.userParams.loginName } onChange={this.asyncLoginName} />
                </FormItem>

                <FormItem label="姓名" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    <Input placeholder="请输入姓名" value={ this.state.userParams.userName } onChange={this.asyncUserName} />
                </FormItem>

                <FormItem label="邮箱" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    <Input placeholder="请输入邮箱" value={ this.state.userParams.email } onChange={this.asyncEmail}/>
                </FormItem>

                <FormItem label="手机号" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    <Input placeholder="请输入手机号" value={ this.state.userParams.phone }  onChange={this.asyncPhone}/>
                </FormItem>

                <FormItem label="用户类型" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    <Select  value={ this.state.userParams.atdUserType } onSelect={this.handleChangeUserType}>
                        <Option key="100" value="100">{ this.state.NAMES.leader }</Option>
                        <Option key="101" value="101">{ this.state.NAMES.staff }</Option>
                    </Select>
                </FormItem>

                <FormItem label="性别" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    <Select  value={ this.state.userParams.gender } onSelect={this.handleChangegender}>
                        <Option key="0" value="0">男</Option>
                        <Option key="1" value="1">女</Option>
                        <Option key="2" value="2">未知</Option>
                    </Select>
                </FormItem>

                <FormItem label="部门" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
                    <Input placeholder="请输入部门名称" value={ this.state.userParams.dept.name } onChange={this.asyncDepName}  style={{ width:250 }} />
                    <Popover content={menu()} title="选择部门" trigger="click" visible={this.state.popShow} onVisibleChange={this.handlePopChange}>
                        <Button style={{marginLeft:10}} type="primary">选择</Button>
                    </Popover>
                </FormItem>


                {/* <FormItem
                label="Radio 单选框"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                >
                <RadioGroup defaultValue="b">
                    <Radio value="a">A</Radio>
                    <Radio value="b">B</Radio>
                    <Radio value="c">C</Radio>
                    <Radio value="d">D</Radio>
                </RadioGroup>
                </FormItem> */}
            </Form>
        </Modal>
        </Spin>;
    }
}

export default UserMange