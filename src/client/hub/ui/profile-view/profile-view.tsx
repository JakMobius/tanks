
import React from "react"
import Cloud from "src/client/game/ui/cloud/cloud"
import { PauseMenuButton, PauseNavigationItem } from "src/client/ui/pause-overlay/pause-menu-view"
import { useProfile } from "../hub-page"
import { api } from "src/client/networking/api"
import { useAbortControllerCleanup } from "src/client/utils/abort-controller-cleanup"

const ProfileView: React.FC = () => {
    let profile = useProfile()
    const { addCleanup, removeCleanup } = useAbortControllerCleanup()

    const logout = () => {
        let abortController = new AbortController()
        api("ajax/logout", {
            method: "POST"
        })
        .then(() => window.location.reload())
        .finally(() => removeCleanup(abortController))
        addCleanup(abortController)
    }

    return (
        <PauseNavigationItem title="Профиль">
            <Cloud>Вы {profile.username}</Cloud>
            <PauseMenuButton red onClick={logout}>Выйти</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default ProfileView