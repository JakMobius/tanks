
import PauseInputRow from "src/client/ui/overlay/pause-overlay/elements/pause-input-row";
import React, { useEffect, useState } from "react";
import { PauseMenuButton, PauseNavigationItem } from "src/client/ui/overlay/pause-overlay/pause-menu-view";

interface MainViewProps {
    onSubmit?: (map: {
        mapName: string,
        mapWidth: number,
        mapHeight: number
    }) => void
}

const NewMapView: React.FC<MainViewProps> = (props) => {

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

    return (
        <PauseNavigationItem title="Новая карта">
            <PauseInputRow
                title="Название"
                placeholder={defaultMapName}
                onChange={onNameChange}
                {...style(formState.mapNameValid)}
                value={formState.mapName}/>
            <PauseInputRow
                title="Ширина"
                placeholder={defaultMapWidth}
                suffix=" блоков"
                onChange={onWidthChange}
                {...style(formState.mapWidthValid)}
                value={formState.mapWidth}/>
            <PauseInputRow
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
                        props.onSubmit?.({
                            mapName: formState.mapName,
                            mapWidth: parseInt(formState.mapWidth),
                            mapHeight: parseInt(formState.mapHeight)
                        })
                    }
                }}
            />
        </PauseNavigationItem>
    )
}

export default NewMapView;