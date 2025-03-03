
import { PauseKeyInputRow } from "src/client/ui/pause-overlay/elements/pause-input-row";
import React, { useEffect, useState } from "react";
import { PauseMenuButton, PauseNavigationItem } from "src/client/ui/pause-overlay/pause-menu-view";


const NewMapView: React.FC = (props) => {

    const defaultMapName = "Безымянная карта"
    const defaultMapWidth = "50"
    const defaultMapHeight = "50"

    const [formState, setFormState] = useState({
        mapName: "",
        mapWidth: "",
        mapHeight: "",
        mapNameValid: true,
        mapWidthValid: true,
        mapHeightValid: true,
        formValid: true
    });

    const verifySize = (value: string) => {
        let number = null
        let isNumber = value.match(/^-?\d+$/)
        if (isNumber) {
            number = parseInt(value)
            if (number < 1) number = null
            if (number > 256) number = null
        }
        return number !== null
    }

    const verifyName = (value: string) => {
        return value.length <= 24
    }

    const onNameChange = (name: string) => {
        const valueOrPlaceholder = name.length === 0 ? defaultMapName : name

        setFormState((prevState) => ({
            ...prevState,
            mapName: name,
            mapNameValid: verifyName(valueOrPlaceholder),
        }))
    }

    const onWidthChange = (width: string) => {
        const valueOrPlaceholder = width.length === 0 ? defaultMapWidth : width

        setFormState((prevState) => ({
            ...prevState,
            mapWidth: width,
            mapWidthValid: verifySize(valueOrPlaceholder),
        }))
    }

    const onHeightChange = (height: string) => {
        const valueOrPlaceholder = height.length === 0 ? defaultMapHeight : height

        setFormState((prevState) => ({
            ...prevState,
            mapHeight: height,
            mapHeightValid: verifySize(valueOrPlaceholder),
        }))
    }

    useEffect(() => {
        setFormState((prevState) => ({
            ...prevState,
            formValid: prevState.mapNameValid && prevState.mapWidthValid && prevState.mapHeightValid,
        }));
    }, [formState.mapNameValid, formState.mapWidthValid, formState.mapHeightValid]);

    const style = (isValid: boolean) => {
        return {
            blue: isValid,
            red: !isValid
        }
    }

    const createMap = () => {
        let name = formState.mapName.length === 0 ? defaultMapName : formState.mapName
        let width = formState.mapWidth.length === 0 ? defaultMapWidth : formState.mapWidth
        let height = formState.mapHeight.length === 0 ? defaultMapHeight : formState.mapHeight


    }

    return (
        <PauseNavigationItem title="Новая карта">
            <PauseKeyInputRow
                title="Название"
                placeholder={defaultMapName}
                onChange={onNameChange}
                {...style(formState.mapNameValid)}
                value={formState.mapName}/>
            <PauseKeyInputRow
                title="Ширина"
                placeholder={defaultMapWidth}
                suffix=" блоков"
                onChange={onWidthChange}
                {...style(formState.mapWidthValid)}
                value={formState.mapWidth}/>
            <PauseKeyInputRow
                title="Высота"
                placeholder={defaultMapHeight}
                suffix=" блоков"
                onChange={onHeightChange}
                {...style(formState.mapHeightValid)}
                value={formState.mapHeight}/>
            <PauseMenuButton
                blue={formState.formValid}
                onClick={() => {
                    if (formState.formValid) {
                        createMap()
                    }
                }}
            >Создать</PauseMenuButton>
        </PauseNavigationItem>
    )
}

export default NewMapView;