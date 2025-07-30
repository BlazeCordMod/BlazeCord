import type { FC } from "react";
import { getComponentFromProps } from "../util";

interface TableRowtrailingTextProps {
    text: string;
}

type TableRowtrailingText = FC<TableRowtrailingTextProps>;

export default getComponentFromProps("TableRowtrailingText") as TableRowtrailingText;
