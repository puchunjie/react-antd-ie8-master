import React, {
    Component
} from "react";
import {
    TreeSelect
} from 'antd';
import { $post } from "../utils/auth";
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
    onChange = (value, label, extra) => {
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
        console.log(flatten(outPut))
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
        $post('/paiban/api/user/v1/tree').done(res => {
			if(res.status == 200){
                const modfiyTree = (list) => {
                    let arr = list || [];
                    arr = JSON.parse(JSON.stringify(arr));
                    return arr.map(item => {
                        let data = Object.assign({},item);
                        data.value = data.id;
                        data.label = data.text;
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
        return <TreeSelect style={{ width:'100%' }} {...tProps} />;
    }
}

export default UserTree