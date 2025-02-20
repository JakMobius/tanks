import React from "react";
import { localizeAjaxError } from "../../localizations";
import { PauseInputDetailDisclosure, PauseInputRow } from "src/client/ui/pause-overlay/elements/pause-input-row";
import { PauseNavigationItem } from "src/client/ui/pause-overlay/pause-menu-view";
import Cloud from "src/client/game/ui/cloud/cloud";
import { useNavigation } from "src/client/ui/navigation/navigation-view";
import TipList, { Tip, TipStyle } from "../../tip-list/tip-list";
import RegisterView from "../register-view/register-view";

const LoginView: React.FC = () => {

    const navigation = useNavigation()

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
                button={<PauseInputDetailDisclosure blue onClick={onLogin}/>}
            />
            <TipList tips={state.tips}/>
        </PauseNavigationItem>
    );
}

export default LoginView