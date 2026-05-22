import * as fetch from "./api/fetch";
import * as crud from "./api/crud";
import * as notes from "./api/notes";

export const useAPIResource = () => {
	return {
		...fetch,
		...crud,
		...notes,
	};
};
