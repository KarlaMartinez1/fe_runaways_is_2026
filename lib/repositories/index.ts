import { httpPropertyRepository } from "./http/property-repository.http";
import { mockPropertyRepository } from "./mock/property-repository.mock";

const useMocks = process.env.USE_MOCKS === "true";

export const propertyRepository = useMocks ? mockPropertyRepository : httpPropertyRepository;