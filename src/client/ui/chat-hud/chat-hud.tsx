import './chat-hud.scss'

import HTMLEscape from 'src/utils/html-escape';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import Color from 'src/utils/color';

import React, { useEffect, useRef, useState } from 'react';
import { useControls } from 'src/client/utils/react-controls-responder';

function parseColor(text: string) {
    return Color.replace(text, function (color: string, bold: boolean, text: string) {
        if (bold) {
            if (color)
                return "<span style='font-weight:bold;color:#" + color + ";'>" + text + "</span>"

            return "<span style='font-weight:bold;'>" + text + "</span>"
        } else {
            if (color)
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
        <div className="message-container">
            <div ref={divRef} style={props.style} className="message"></div>
        </div>
    )
}

export interface ChatMessagesInterface {
    addMessage: (message: string) => void
}

interface CustomScrollbarProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
}
interface ChatMessagesProps {
    getMessage?: (index: number) => string
    messageCount?: number
}

interface ScrollerProps {
    style?: React.CSSProperties
}

const Scroller = React.forwardRef<HTMLDivElement, ScrollerProps>(({ style, ...props }, ref) => {
    return <div
        style={{
            ...style,
            boxSizing: "content-box",
            width: "100%",
            paddingRight: "50px"
        }}
        ref={ref} 
        {...props}
    />
})
  

const ChatMessages: React.FC<ChatMessagesProps> = (props: ChatMessagesProps) => {

    const maxHeight = 400

    const [state, setState] = useState({
        height: 0,
        messageCount: 0
    })

    const scrollerRef = useRef<HTMLElement | null>(null)
    const virtuosoRef = useRef<VirtuosoHandle | null>(null)
    const messagesRef = useRef<string[]>([])

    const onListHeightChange = (height: number) => {
        setState(state => ({ ...state, height }))
    }

    return (
        <div className="chat" style={{ height: Math.min(state.height, maxHeight) }}>
            <Virtuoso
                components={{ Scroller }}
                followOutput={true}
                tabIndex={null}
                ref={virtuosoRef}
                scrollerRef={(scroller) => { scrollerRef.current = scroller as HTMLElement }}
                increaseViewportBy={{ top: 0, bottom: Math.max(0, maxHeight - state.height) }}
                totalListHeightChanged={onListHeightChange}
                totalCount={props.messageCount}
                itemContent={(index) => (
                    <ChatMessage message={props?.getMessage(index)} />
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

    const inputRef = useRef<HTMLInputElement | null>(null)
    const gameControls = useControls()

    const onInputKeydown = (event: KeyboardEvent) => {
        let input = inputRef.current as HTMLInputElement

        if (event.key === "Enter") {
            let value = input.value.trim()
            input.value = ""
            setShown(false)

            if (value.length) {
                props.onChat(value)
            }

            event.preventDefault()
            event.stopPropagation()
        } else if (event.key === "Escape") {
            input.value = ""
            setShown(false)
            event.preventDefault()
            event.stopPropagation()
        }
    }

    const onInputBlur = (event: React.FocusEvent) => {
        setShown(false)
    }

    useEffect(() => {
        if (!gameControls) return undefined
        const openChat = () => {
            setShown(true)
        }
        gameControls.on("game-chat", openChat)
        return () => gameControls.off("game-chat", openChat)
    }, [gameControls])

    useEffect(() => {
        if (shown) inputRef.current?.focus()
        else inputRef.current?.blur()
    }, [shown])

    useEffect(() => {
        inputRef.current.addEventListener("keydown", onInputKeydown)
    }, [])

    return (
        <div className="input-container">
            <input
                style={{ display: shown ? undefined : "none" }}
                ref={inputRef}
                className="chat-input"
                placeholder="Ваше сообщение"
                onBlur={onInputBlur}
            />
        </div>
    )
}

export interface ChatHUDProps {
    onChat?: (value: string) => void
    messageCount: number
    getMessage: (index: number) => string
}

const ChatHUD: React.FC<ChatHUDProps> = React.memo((props) => {
    return (
        <div className="chat-container">
            <ChatMessages messageCount={props.messageCount} getMessage={props.getMessage} />
            <ChatInput onChat={props.onChat} />
        </div>
    )
})

export default ChatHUD