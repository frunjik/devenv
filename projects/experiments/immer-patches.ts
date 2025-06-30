// version 6
import {produce, applyPatches, enablePatches, type Patch} from "immer"

enablePatches()

let state = {
    name: "Micheal",
    age: 32
}

// Let's assume the user is in a wizard, and we don't know whether
// his changes should end up in the base state ultimately or not...
let fork = state
// all the changes the user made in the wizard
let changes: Patch[] = []
// the inverse of all the changes made in the wizard
let inverseChanges: Patch[] = []

fork = produce(
    fork,
    draft => {
        draft.age = 33
    },
    // The third argument to produce is a callback to which the patches will be fed
    (patches, inversePatches) => {
        changes.push(...patches)
        inverseChanges.push(...inversePatches)
    }
)

// In the meantime, our original state is replaced, as, for example,
// some changes were received from the server
state = produce(state, draft => {
    draft.name = "Michel"
})

// When the wizard finishes (successfully) we can replay the changes that were in the fork onto the *new* state!
state = applyPatches(state, changes)

// state now contains the changes from both code paths!
// expect(state).toEqual({
//     name: "Michel", // changed by the server
//     age: 33 // changed by the wizard
// })

console.log(state);


// Finally, even after finishing the wizard, the user might change his mind and undo his changes...
state = applyPatches(state, inverseChanges)
// expect(state).toEqual({
//     name: "Michel", // Not reverted
//     age: 32 // Reverted
// })

console.log(state);

console.log(changes);
console.log(inverseChanges);
