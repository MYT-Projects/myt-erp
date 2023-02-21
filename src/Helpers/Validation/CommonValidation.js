//Handle validation Change
export const handleValidationChange = (name, value, set) => {
    set(prevState => ({
        ...prevState,
        [name]: value
    }));
}