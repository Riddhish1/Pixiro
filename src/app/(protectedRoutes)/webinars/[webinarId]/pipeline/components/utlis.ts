import { AttendedTypeEnum, CtaTypeEnum } from "../../../../../../../prisma/generated/client"

export const getColumnsForCtaType = (ctaType: CtaTypeEnum): AttendedTypeEnum[] => {
  // Common columns for both CTA types
  const commonColumns = [
    AttendedTypeEnum.REGISTERED,
    AttendedTypeEnum.ATTENDED,
    AttendedTypeEnum.FOLLOW_UP,
    AttendedTypeEnum.CONVERTED,
  ]

  // Add specific columns based on CTA type
  if (ctaType === CtaTypeEnum.BUY_NOW) {
    return [...commonColumns, AttendedTypeEnum.ADDED_TO_CART]
  } else {
    // BOOK_A_CALL
    return [...commonColumns, AttendedTypeEnum.BREAKOUT_ROOM]
  }
}

export const formatColumnTitle = (columnType: AttendedTypeEnum): string => {
  return columnType
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}
