
import "../login-password-view/login-password-view.scss"

import React from "react";
import {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";
import { ButtonComponent } from "src/client/ui/button/button";
import HugeTitle from "../huge-title/huge-title";
import HugeTextInput from "../huge-text-input/huge-text-input";
import { localizeAjaxError } from "../../localizations";
import { NavigationItem } from "src/client/ui/navigation/basic-navigation-view";

const LoginView: React.FC = () => {

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
             // TODO: Figure out a better way
            // props.page.eventContainer.createEvent(msg)
        })
    }

    const setLogin = (login: string) => setState((state) => ({...state, login}))
    const setPassword = (password: string) => setState((state) => ({...state, password}))

    return (
        <NavigationItem title="Вход">
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
        </NavigationItem>
    );
}

export default LoginView