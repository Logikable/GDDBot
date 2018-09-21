const msg = "wes world"
const a = msg.match(/(?:\S+\s+)*(wes|wesley)\s+(?:\S+\s+)*/g)
if (a) {
    console.log(a)
}
