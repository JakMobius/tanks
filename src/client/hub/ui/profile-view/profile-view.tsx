
import React from "react"
import Cloud from "src/client/game/ui/cloud/cloud"
import { PauseMenuButton, PauseNavigationItem } from "src/client/ui/pause-overlay/pause-menu-view"
import { useProfile } from "../hub-page"

const ProfileView: React.FC = () => {
    let profile = useProfile()

    const logout = () => {
        $.ajax({
            url: "ajax/logout",
            method: "post"
        }).done(() => {
            window.location.reload()
        })
    }

    return (
        <PauseNavigationItem title="Профиль">
            <Cloud>Вы {profile.username}</Cloud>
            <PauseMenuButton red onClick={logout}>Выйти</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default ProfileView