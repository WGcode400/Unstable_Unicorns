﻿export { UUID4 }

class UUID4
{
    constructor() {
        this.newID()
    }
    //-------------------------------------------------------------------------
    // Uses:
    //  Created a Guid/Uuid
    //-------------------------------------------------------------------------
    newID() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
}

