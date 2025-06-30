import { produce } from 'immer'

const baseState = [
    {
        title: 'Learn TypeScript',
        done: true
    },
    {
        title: 'Try Immer',
        done: false
    }
]

const nextState = produce(baseState, draftState => {
    draftState.push({ title: 'Tweet about it', done: false })
    draftState[1].done = true
})

console.log(nextState)
