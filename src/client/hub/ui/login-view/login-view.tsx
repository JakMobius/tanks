import React from "react";
import { localizeAjaxError } from "../../localizations";
import { PauseInputDetailDisclosure, PauseInputRow } from "src/client/ui/pause-overlay/elements/pause-input-row";
import { PauseNavigationItem } from "src/client/ui/pause-overlay/pause-menu-view";
import Cloud from "src/client/game/ui/cloud/cloud";
import { useNavigation } from "src/client/ui/navigation/navigation-view";
import TipList, { Tip, TipStyle } from "../../tip-list/tip-list";
import RegisterView from "../register-view/register-view";
import { useEvents } from "src/client/ui/events-hud/events-hud";
import { BasicEvent } from "src/client/ui/events-hud/basic-event-view";
import { api } from "src/client/networking/api";
import { useAbortControllerCleanup } from "src/client/utils/abort-controller-cleanup";

const LoginView: React.FC = () => {

    const navigation = useNavigation()
    const events = useEvents()
    const { addCleanup, removeCleanup } = useAbortControllerCleanup()

    const [state, setState] = React.useState({
        login: "",
        password: "",
        tips: [] as Tip[]
    })

    const loginSuccessful = () => {
        window.location.reload()
    }

    const showError = (error: string) => {
        setState((state) => ({
            ...state,
            tips: [{
                text: error,
                style: TipStyle.ERROR
            }]
        }))
    }

    const parseResult = (result: any) => {
        switch (result.result) {
            case 'ok':                  loginSuccessful();    break;
            case 'invalid-credentials': showError("Неверный позывной или пароль"); break;
            default: break;
        }
    }

    const onLogin = () => {
        let abortController = new AbortController()
        api("ajax/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login: state.login,
                password: state.password
            }),
            signal: abortController.signal
        })
        .then(parseResult)
        .catch(error => showError(localizeAjaxError(error)))
        .finally(() => removeCleanup(abortController))

        addCleanup(abortController)
    }

    const setLogin = (login: string) => setState((state) => ({...state, login, tips: []}))
    const setPassword = (password: string) => setState((state) => ({...state, password, tips: []}))

    const navigateToRegistration = () => {
        navigation.push(<RegisterView/>)
    }

    return (
        <PauseNavigationItem title="Вход" rightNavigationItem={
            <Cloud 
                className="cloudy-navigation-header-item"
                rightArrowed
                button
                onClick={navigateToRegistration}
            >Регистрация</Cloud>
        }>
            <PauseInputRow
                blue
                onChange={setLogin}
                placeholder="Позывной"
            />
            <PauseInputRow
                blue
                onChange={setPassword}
                placeholder="••••••••••"
                type="password"
                button={<PauseInputDetailDisclosure blue button onClick={onLogin}/>}
            />
            <TipList tips={state.tips}/>
        </PauseNavigationItem>
    );
}

export default LoginView