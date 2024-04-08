
import EditProfile from "../EditProfile/EditProfile";
import {useEffect, useState} from "react";
import AccountService from "../../../service/AccountService";
import {useSelector} from "react-redux";
import CreateDoctor from "../CreateDoctor/CreateDoctor";

const RegisterOwner = () => {
    const account = useSelector(state => state.account);


    const checkOwner = () => {
            return <div className={"col-9"}>
                <h3 className="text-uppercase mb-4">Tạo Mới Bác Sĩ</h3>
                <div style={{marginLeft:'50px'}}>
                    <CreateDoctor />
                </div>
            </div>
    }

    return (
            checkOwner()
    );
};

export default RegisterOwner;
