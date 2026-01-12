import { Pet } from '../../../generated-api';

export type PetSlice = {
    pets: Pet[];
    addPet: (pet: Pet) => void;
    removePet: (id: number) => void;
};

export const createPetSlice = (set: any): PetSlice => ({
    pets: [],
    addPet: (pet: Pet) => set((state: any) => ({ pets: [...state.pets, pet] })),
    removePet: (id: number) => set((state: any) => ({ pets: state.pets.filter(p => p.petId !== id) })),
});