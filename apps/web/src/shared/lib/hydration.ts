let isHydratingDocument = false;

export const beginHydration = () => {
  isHydratingDocument = true;
};

export const endHydration = () => {
  isHydratingDocument = false;
};

export const isHydrating = () => isHydratingDocument;
