(() => {
    /*
    NOTES:
    Virtual keys are not created or destroyed in the traditional sense.
    Instead a virtual key which has no bindings to physical keys is the same under the hood as a virtual key who has never been defined in the first place.
    So to "delete" a virtual key simply call UnbindVirtual and then never rebind it.

    IsPressed returns a giant or statement so if any of the bound physical keys are pressed this will return true.
    IsDown returns true if and only if one or more of the physical keys bound to this virtual key is pressed now but wasn't pressed last frame.
    IsUp returns true if and only if one or more of the physical keys bound to this virtual key is not pressed now but was pressed last frame.

    This means that you can have a situation where a key is not pressed then is down then is down a second time then up then up a second time before IsPressed finally returns false.
    This can occur if say jump is bound to space and to W and the user presses W down then space down then W up then space up.
    */

    const internals = {};
    internals.PhysicalKeys = new Map(); // Map(physicalKey:string, value:object(isPressed:bool))
    internals.VirtualKeys = new Map(); // Map(virtualKey:string, value:object(isPressed:bool, isDown:bool, isUp:bool, bindings:object(physicalKey:string)[]))
    globalThis.InputJS = {};
    window.addEventListener("blur", () => {
        internals.PhysicalKeys.forEach((pk, physicalKey) => {
            pk.isPressed = false;
        });
    });
    window.addEventListener("keydown", (event) => {
        const physicalKey = event.key;
        let pk = internals.PhysicalKeys.get(physicalKey);
        if (pk == undefined) {
            pk = { isPressed: false };
            internals.PhysicalKeys.set(physicalKey, pk);
        }
        pk.isPressed = true;
    });
    window.addEventListener("keyup", (event) => {
        const physicalKey = event.key;
        let pk = internals.PhysicalKeys.get(physicalKey);
        if (pk == undefined) {
            pk = { isPressed: false, bindings: [] };
            internals.PhysicalKeys.set(physicalKey, pk);
        }
        pk.isPressed = false;
    });

    // Binds a physical key to a virtual key
    // Returns true if this function all did something else false
    InputJS.Bind = (physicalKey, virtualKey) => {
        let vk = internals.VirtualKeys.get(virtualKey);
        if (vk == undefined) {
            vk = { isPressed: false, isDown: false, isUp: false, bindings: [physicalKey] };
            internals.VirtualKeys.set(virtualKey, vk);
            return true;
        }
        if (!vk.bindings.includes(physicalKey)) {
            vk.bindings.push(physicalKey);
            return true;
        }
        return false;
    }
    // Unbinds a physical key from a virtual key
    // Returns true if this function all did something else false
    InputJS.Unbind = (physicalKey, virtualKey) => {
        let vk = internals.VirtualKeys.get(virtualKey);
        if (vk == undefined) {
            return false;
        }
        const indexOfPk = vk.bindings.indexOf(physicalKey);
        if (indexOfPk == -1) {
            return false;
        }
        vk.bindings.splice(indexOfPk, 1);
        if (vk.bindings.length == 0) {
            internals.VirtualKeys.delete(virtualKey);
        }
        return true;
    }
    // Unbinds a physical key from all virtual keys
    // Returns true if this function all did something else false
    InputJS.UnbindAll = (virtualKey) => {
        if (internals.VirtualKeys.has(virtualKey)) {
            internals.VirtualKeys.delete(virtualKey);
            return true;
        }
        return false;
    }
    // This function must be called once per frame to sync the input polling to your games particular framerate
    InputJS.Update = () => {
        internals.VirtualKeys.forEach((vk, virtualKey) => {
            const wasPressed = vk.isPressed;
            vk.isPressed = false;
            for (let i = 0; i < vk.bindings.length; i++) {
                if (vk.bindings[i].isPressed) {
                    vk.isPressed = true;
                    break;
                }
            }
            if (vk.isPressed && !wasPressed) {
                vk.isDown = true;
                vk.isUp = false;
            } else if (!vk.isPressed && wasPressed) {
                vk.isDown = false;
                vk.isUp = true;
            } else {
                vk.isDown = false;
                vk.isUp = false;
            }
        });
    }
    // Returns true if the virtual key is pressed else false
    InputJS.IsPressed = (virtualKey) => {
        let vk = internals.VirtualKeys.get(virtualKey);
        if (vk == undefined) {
            return false;
        }
        return vk.isPressed;
    }
    // Returns true if the virtual key is down on this frame else false
    InputJS.IsDown = (virtualKey) => {
        let vk = internals.VirtualKeys.get(virtualKey);
        if (vk == undefined) {
            return false;
        }
        return vk.isDown;
    }
    // Returns true if the virtual key is up on this frame else false
    InputJS.IsUp = (virtualKey) => {
        let vk = internals.VirtualKeys.get(virtualKey);
        if (vk == undefined) {
            return false;
        }
        return vk.isUp;
    }
})();