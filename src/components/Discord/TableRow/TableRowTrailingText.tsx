import type { FC } from "react";
import { getComponentFromProps } from "../util";

interface TableRoblzrailingTextProps {
    text: string;
}

type TableRoblzrailingText = FC<TableRoblzrailingTextProps>;

export default getComponentFromProps("TableRoblzrailingText") as TableRoblzrailingText;
