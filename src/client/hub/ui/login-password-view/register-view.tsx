
import "./login-password-view.scss"

import {Tip, TipStyle} from "../input-tip-list/input-tip-list-view";
import {checkNick} from "src/data-checkers/nick-checker";
import {localizeAjaxError, textFromNickCheckResult} from "src/client/hub/localizations";
import {passwordScore} from "src/data-checkers/password-checker";

import React from "react";
import HugeTextInput from "../huge-text-input/huge-text-input";
import HugeTitle from "../huge-title/huge-title";
import { NavigationItem } from "src/client/ui/navigation/basic-navigation-view";

const RegisterView: React.FC = () => {

    const [state, setState] = React.useState({
        login: "",
        password: "",
        loginTips: [] as Tip[],
        passwordTips: [] as Tip[],
        loginCorrect: false,
        passwordCorrect: false
    })

    const onSuccessfulRegister = () => {
        window.location.reload()
    }

    const onLoginUsed = () => {
        setState((state) => ({
            ...state,
            loginTips: [{
                text: "Этот позывной уже кем-то занят",
                style: TipStyle.ERROR
            }],
            loginCorrect: false
        }))
    }

    const handleResult = (result: any) => {
        switch(result.result) {
            case "ok": onSuccessfulRegister(); break;
            case "login-used": onLoginUsed(); break;
            case "check-login": checkLogin(); break;
            case "check-password": checkPassword(); break;
        }
    }

    const onRegister = () => {
        $.ajax({
            url: "ajax/register",
            method: "post",
            data: {
                login: state.login,
                password: state.password
            }
        }).done((result) => {
            handleResult(result)
        }).fail((xhr, exception) => {
            let msg = localizeAjaxError(xhr, exception)
             // TODO: Figure out a better way
            // props.page.eventContainer.createEvent(msg)
        })
    }

    const setLogin = (login: string) => {
        setState((state) => ({...state, login}))
        checkLogin()
    }

    const setPassword = (password: string) => {
        setState((state) => ({...state, password}))
        checkPassword()
    }

    const checkLogin = () => {
        let tips: Tip[] = checkNick(state.login).map(a => {
            return {
                text: textFromNickCheckResult(a),
                style: TipStyle.ERROR
            }
        })
        
        setState((state) => ({
            ...state,
            loginCorrect: tips.length == 0,
            loginTips: tips
        }))
    }

    const checkPassword = () => {
        let score = passwordScore(state.password)
        let tip: Tip = { text: null, style: null }
        let passwordCorrect = true

        if(score < 35) {
            passwordCorrect = false
            tip.style = TipStyle.ERROR
            tip.text = "Это разве пароль?"
        } else if(score < 55) {
            tip.style = TipStyle.WARNING
            tip.text = "Простой пароль"
        } else if(score < 75) {
            tip.style = TipStyle.WEAK_WARNING
            tip.text = "Неплохой пароль"
        } else {
            tip.style = TipStyle.FINE
            tip.text = "Непробиваемый пароль"
        }

        setState((state) => ({
            ...state,
            passwordCorrect,
            passwordTips: [tip]
        }))
    }

    return (
        <NavigationItem title="Регистрация">
            <div className="login-password-view">
                <HugeTitle>Регистрация</HugeTitle>
                <div className="field-container">
                    <HugeTextInput
                        onChange={setLogin}
                        placeholder="Позывной"
                        tips={state.loginTips}
                    />
                    <HugeTextInput
                        onChange={setPassword}
                        placeholder="••••••••••"
                        type="password"
                        tips={state.passwordTips}
                    />
                </div>
                <div className="auth-button-container">
                    <button 
                        className="large"
                        disabled={!state.loginCorrect || !state.passwordCorrect}
                        onClick={onRegister}
                    >Регистрация</button>
                </div>
            </div>
        </NavigationItem>
    );
}

export default RegisterView