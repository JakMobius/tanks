
import "../login-password-view/login-password-view.scss"

import React from "react";
import {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";
import {HubPage} from "../hub-page";
import { ButtonComponent } from "src/client/ui/button/button";
import HugeTitle from "../huge-title/huge-title";
import HugeTextInput from "../huge-text-input/huge-text-input";
import { localizeAjaxError } from "../../localizations";

interface LoginViewProps {
    page: HubPage
}

const LoginView: React.FC<LoginViewProps> = (props) => {

    const [state, setState] = React.useState({
        login: "",
        password: "",
        tips: [] as Tip[]
    })

    const loginSuccessful = () => {
        window.location.reload()
    }

    const invalidCredentials = () => {
        setState((state) => ({
            ...state,
            tips: [{
                text: "Неверный позывной или пароль",
                style: TipStyle.ERROR
            }]
        }))
    }

    const parseResult = (result: any) => {
        switch (result.result) {
            case 'ok':                  loginSuccessful();    break;
            case 'invalid-credentials': invalidCredentials(); break;
            default: break;
        }
    }

    const onLogin = () => {
        $.ajax({
            url: "ajax/login",
            method: "post",
            data: {
                login: state.login,
                password: state.password
            }
        }).done((result) => {
            parseResult(result)
        }).fail((xhr, exception) => {
            let msg = localizeAjaxError(xhr, exception)
            props.page.eventContainer.createEvent(msg)
        })
    }

    const setLogin = (login: string) => setState((state) => ({...state, login}))
    const setPassword = (password: string) => setState((state) => ({...state, password}))

    return (
        <div className="login-password-view">
            <HugeTitle>Вход</HugeTitle>
            <div className="field-container">
                <HugeTextInput
                    onChange={setLogin}
                    placeholder="Позывной"
                    tips={state.tips}
                />
                <HugeTextInput
                    onChange={setPassword}
                    placeholder="••••••••••"
                    type="password"
                />
            </div>
            <div className="auth-button-container">
                <ButtonComponent largeStyle onClick={onLogin}>Вход</ButtonComponent>
                <ButtonComponent secondaryStyle>Забыли пароль?</ButtonComponent>
            </div>
        </div>
    );
}

export default LoginView