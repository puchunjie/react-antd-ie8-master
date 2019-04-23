import React, {
    Component
} from "react";
import {
    TreeSelect,
    Button
} from 'antd';
import { $post } from "../utils/auth";
import { NAMES } from '../utils/configs'
import './userTree.less'
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const flatten = (arr) => {
    return arr.reduce((flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}
class UserTree extends Component {
    state = {
        value: [],
        treeData: []
    }
    onChange = (value) => {
        this.setState({
            value
        });
        let outPut = value.map(item => {
            let isDept = item.includes('dept');
            // if(isDept){
            //     return this.state.treeData.find(el => el.id == item).children;
            // }else{
            //     return [this.findTarget(item,this.state.treeData)]
            // }
            if(isDept){
                return this.findTarget(item,this.state.treeData) ? this.findTarget(item,this.state.treeData).children : []
            }else {
                return [this.findTarget(item,this.state.treeData)]
            }
        });
        this.props.onChange(flatten(outPut))
    }

    // 查找树
    findTarget(targetName, source) {
		let resut = undefined;
        for (let item of source) {
			if (item.id === targetName) {
				resut = item
				if(resut) return resut
			}else if(item.children && item.children.length) {
				resut = this.findTarget(targetName, item.children)
				if(resut) return resut
			}
		}
	}

    // 获取人员数据
    getUerData(){
        $post('/paiban/api/user/v1/tree?onDuty=true').done(res => {
			if(res.status == 200){
                const modfiyTree = (list) => {
                    let arr = list || [];
                    arr = JSON.parse(JSON.stringify(arr));
                    return arr.map(item => {
                        let data = Object.assign({},item);
                        data.value = data.id;
                        let desc = data.attributes.atdUserType ? `(${data.attributes.atdUserTypeName})` : '';
                        data.label = data.text + desc;
                        data.key = data.id;
                        data.children = modfiyTree(data.children);
                        return data
                    })
                }
				this.setState({
					treeData: modfiyTree(res.body)
                })
			}
		})
    }

    allTree = () => {
        let values = this.state.treeData.map(item => item.id);
       this.onChange(values)
    }


    componentDidMount(){
        this.getUerData()
    }

    render() {
        const tProps = {
            treeData: this.state.treeData,
            value: this.state.value,
            onChange: this.onChange,
            multiple: true,
            treeCheckable: true,
            allowClear: true,
            showCheckedStrategy: SHOW_PARENT,
            searchPlaceholder: '请选择'
          };
        return <div>
                <TreeSelect style={{ width:650,maxHeight: 125,overflowX: 'hidden' }} {...tProps} />
                <Button style={{marginLeft:10}} onClick={this.allTree} type="primary">全选</Button>
            </div>;
    }
}

export default UserTree