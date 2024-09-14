import TransmissionComponent from "src/entity/components/transmission/transmission-component";

export default class TransmissionUnit {
    transmission: TransmissionComponent

    onTick(dt: number) {}

    onAttach(transmission: TransmissionComponent) {}
    onDetach() {}
}