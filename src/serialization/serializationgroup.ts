
class Group {
    array = []

    register(clazz) {
        const clazzType = clazz.typeName()

        for(let eachClazz of this.array) {
            if(eachClazz.typeName() === clazzType) {
                throw new Error(`Type name '${clazzType}' is already registered in this group.`)
            }
        }

        this.array.push(clazz);
    }

    get(type) {

        for(let eachClazz of this.array) {
            if(eachClazz.typeName() === type) {
                return eachClazz
            }
        }

        return null
    }
}

export default Group;