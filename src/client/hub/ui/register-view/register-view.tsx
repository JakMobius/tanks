import "./register-view.scss"

import {checkNick} from "src/data-checkers/nick-checker";
import {localizeAjaxError, textFromNickCheckResult} from "src/client/hub/localizations";
import {passwordScore} from "src/data-checkers/password-checker";
import { PauseNavigationItem } from "src/client/ui/overlay/pause-overlay/pause-menu-view";
import { PauseInputRow, PauseInputDetailDisclosure } from "src/client/ui/overlay/pause-overlay/elements/pause-input-row";
import TipList, { Tip, TipStyle } from "../../tip-list/tip-list";
import React from "react";

const RegisterView: React.FC = () => {

    const [state, setState] = React.useState({
        login: "",
        password: "",
        loginTips: [] as Tip[],
        passwordTips: [] as Tip[],
        loginCorrect: false,
        passwordCorrect: false,
        passwordStrengthClass: ""
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
        if(!state.passwordCorrect) {
            setState((state) => ({
                ...state,
                passwordTips: [{
                    style: TipStyle.ERROR,
                    text: "Это разве пароль?"
                }]
            }))
            return
        }

        if(!state.loginCorrect) {
            return
        }

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
        setState((state) => {
            console.log(state.login)
            let tips: Tip[] = checkNick(state.login).map(a => {
                return {
                    text: textFromNickCheckResult(a),
                    style: TipStyle.ERROR
                }
            })
            
            return {
                ...state,
                loginCorrect: tips.length == 0,
                loginTips: tips
            }
        })
    }

    const checkPassword = () => {
        setState((state) => {
            let score = passwordScore(state.password)
            let passwordCorrect = true
            let passwordStrengthClass

            if(score < 35) {
                passwordCorrect = false
                passwordStrengthClass = "password-strength red"
            } else if(score < 75) {
                passwordStrengthClass = "password-strength weak"
            } else {
                passwordStrengthClass = "password-strength ok"
            }

            return {
                ...state,
                passwordCorrect,
                passwordTips: [],
                passwordStrengthClass: passwordStrengthClass
            }
        })
    }

    return (
        <PauseNavigationItem title="Регистрация" rightNavigationItem>
            <PauseInputRow
                blue={state.loginCorrect}
                red={!state.loginCorrect}
                onChange={setLogin}
                placeholder="Позывной"
            />
            <PauseInputRow
                blue={state.passwordCorrect}
                red={!state.passwordCorrect}
                onChange={setPassword}
                placeholder="••••••••••"
                type="password"
                className={state.passwordStrengthClass}
                button={
                    <PauseInputDetailDisclosure
                        blue={state.loginCorrect && state.passwordCorrect}
                        button={state.loginCorrect && state.passwordCorrect}
                        onClick={onRegister}
                    />
                }
            />
            <TipList tips={[...state.loginTips, ...state.passwordTips]}/>
        </PauseNavigationItem>
    );
}

export default RegisterView