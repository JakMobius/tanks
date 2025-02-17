import './chat-container.scss'

import View from 'src/client/ui/view';
import HTMLEscape from 'src/utils/html-escape';
import { Virtuoso } from 'react-virtuoso'
import Color from 'src/utils/color';

import ReactDOM from 'react-dom/client';
import React, { Ref, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

function parseColor(text: string) {
    return Color.replace(text, function(color: string, bold: boolean, text: string) {
        if(bold) {
            if(color)
                return "<span style='font-weight:bold;color:#" + color + ";'>" + text + "</span>"

            return "<span style='font-weight:bold;'>" + text + "</span>"
        } else {
            if(color)
                return "<span style='color:#" + color + ";'>" + text + "</span>"
            else
                return text
        }
    })
}

interface ChatMessageProps {
    message: string
    style?: React.CSSProperties
}

const ChatMessage: React.FC<ChatMessageProps> = (props) => {

    let divRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        divRef.current.innerHTML = parseColor(HTMLEscape(props.message))
    }, [props.message])

    return (
        // The wrapper div is needed for Virtuoso to calculate the margin properly
        <div>
            <div ref={divRef} style={props.style} className="message"></div>
        </div>
    )
}

const ChatMessages: React.FC = () => {
    
    const maxHeight = 400

    const stateRef = useRef({
        messages: [] as string[],
    })

    const [state, setState] = useState({
        update: {},
        height: 0
    })

    const onListHeightChange = (height: number) => {
        setState(state => ({...state, height}))
    }

    const addMessage = (message: string) => {
        stateRef.current.messages.push(message)
        setState(state => ({
            ...state,
            update: {}
        }))
    }

    useEffect(() => {
        for(let i = 0; i < 100; i++) {
            addMessage("Привет, вселенная")
            addMessage("Это второе сообщение")
            addMessage("А это сообщение которое делает абобу балабобу многострочную бубобу")
            addMessage("Это еще одно сообщение")
        }
    }, [])

    return (
        <div className="chat">
            <Virtuoso
                style={{height: Math.min(state.height, maxHeight)}}
                increaseViewportBy={{top: 0, bottom: Math.max(0, maxHeight - state.height)}}
                totalListHeightChanged={onListHeightChange}
                totalCount={stateRef.current.messages.length}
                itemContent={(index) => (
                    <ChatMessage message={stateRef.current.messages[index]}/>
                )}
            />
        </div>
    )
}

interface ChatInputProps {
    onChat?: (value: string) => void
}

const ChatInput: React.FC<ChatInputProps> = (props) => {
    const [shown, setShown] = useState(false)

    const onInputKeydown = (event: React.KeyboardEvent) => {
        let input = event.target as HTMLInputElement

        if (event.key === "Enter") {
            let value = input.value.trim()
            setShown(false)

            if(value.length) {
                props.onChat(value)
            }
        } else if(event.key === "Escape") {
            input.value = ""
            setShown(false)
            event.stopPropagation()
        }
    }

    const onInputBlur = (event: React.FocusEvent) => {
        setShown(false)
    }

    return (
        <div className="input-container">
            <input
                style={{display: shown ? undefined : "none"}}
                className="chat-input"
                placeholder="Ваше сообщение"
                onKeyDown={onInputKeydown}
                onBlur={onInputBlur}
                />
        </div>
    )
}

const ChatView: React.FC = (props) => {
    return (
        <div className="chat-container">
            <ChatMessages/>
            <ChatInput/>
        </div>
    )
}

export default class ChatContainer extends View {
    reactRoot: ReactDOM.Root

    constructor() {
        super()
        this.reactRoot = ReactDOM.createRoot(this.element[0])
        this.reactRoot.render(<ChatView/>)
    }
}