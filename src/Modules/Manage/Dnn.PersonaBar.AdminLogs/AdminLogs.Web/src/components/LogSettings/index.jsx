import React, {Component, PropTypes } from "react";
import { connect } from "react-redux";
import {
    logSettings as LogSettingActions,
    log as LogActions
} from "../../actions";
import SettingRow from "./LogSettingRow";
import LogSettingEditor from "./LogSettingEditor";
import "./style.less";
import { AddIcon } from "dnn-svg-icons";
import GridCell from "dnn-grid-cell";
import resx from "../../resources";
import {
    createPortalOptions,
    createLogTypeOptions
} from "../../reducerHelpers";


class LogSettingsPanel extends Component {
    constructor() {
        super();
        this.state = {
            logTypeList: [],
            logSettingList: [],
            portalList: [],
            openId: ""
        };
    }

    componentWillMount() {
        const {props} = this;
        props.dispatch(LogSettingActions.getLogSettings());
        if (this.props.logTypeList === null || this.props.logTypeList === [] || this.props.logTypeList === undefined)
            props.dispatch(LogActions.getLogTypeList());
        if (this.props.portalList === null || this.props.portalList === [] || this.props.portalList === undefined)
            props.dispatch(LogActions.getPortalList());
        props.dispatch(LogSettingActions.getKeepMostRecentOptions());
        props.dispatch(LogSettingActions.getOccurrenceOptions());
    }

    renderHeader() {
        const tableFields = [
            { "name": resx.get("LogType.Header"), "width": 40 },
            { "name": resx.get("Portal.Header"), "width": 20 },
            { "name": resx.get("Active.Header"), "width": 15 },
            { "name": resx.get("FileName.Header"), "width": 20 },
            { "name": "", "width": 5 }
        ];
        let tableHeaders = tableFields.map((field) => {
            return <GridCell columnSize={field.width} style={{ fontWeight: "bolder" }}>
                <span>{field.name}&nbsp; </span>
            </GridCell>;
        });
        return <div id="header-row" className="header-row">{tableHeaders}</div>;
    }
    uncollapse(id) {
        setTimeout(() => {
            this.setState({
                openId: id
            });
        }, this.timeout);
    }
    collapse() {
        if (this.state.openId !== "") {
            this.setState({
                openId: ""
            });
        }
    }
    toggle(openId) {
        if (openId !== "") {
            this.uncollapse(openId);
        } else {
            this.collapse();
        }
    }

    /* eslint-disable react/no-danger */
    renderedLogSettingList(logTypeOptions, portalOptions) {
        let validLogSettingList = this.props.logSettingList.filter(logSetting => !!logSetting);
        let i = 0;
        return validLogSettingList.map((logSetting, index) => {
            let id = "row-" + i++;
            return (
                <SettingRow
                    typeName={logSetting.LogTypeFriendlyName}
                    website={logSetting.LogTypePortalName}
                    activeStatus={logSetting.LoggingIsActive ? resx.get("True") : resx.get("False") }
                    fileName={logSetting.LogFileName}
                    logTypeKey={logSetting.LogTypeKey}
                    index={index}
                    key={"logSetting-" + index}
                    closeOnClick={true}
                    openId={this.state.openId }
                    OpenCollapse={this.toggle.bind(this) }
                    Collapse={this.collapse.bind(this) }
                    id={id}>
                    <LogSettingEditor
                        logTypeList={logTypeOptions }
                        portalList={portalOptions }
                        keepMostRecentOptions={this.props.keepMostRecentOptions}
                        thresholdsOptions={this.props.thresholdsOptions}
                        notificationTimesOptions={this.props.notificationTimesOptions}
                        notificationTimeTypesOptions={this.props.notificationTimeTypesOptions}
                        logTypeSettingId={logSetting.ID}  Collapse={this.collapse.bind(this) } id={id} openId={this.state.openId} />
                </SettingRow>
            );
        });
    }

    render() {
        let opened = (this.state.openId === "add");
        let logTypeOptions = createLogTypeOptions(this.props.logTypeList);
        let portalOptions = createPortalOptions(this.props.portalList);
        return (
            <div>
                <div className="log-settings">
                    <div className="add-setting-row" onClick={this.toggle.bind(this, opened ? "" : "add") }>
                        <div className={"add-setting-box " + !opened}>
                            <div className={"add-icon"} dangerouslySetInnerHTML={{ __html: AddIcon }}>
                            </div> {resx.get("AddContent.Action") }
                        </div>
                    </div>
                    <div className="container">
                        {this.renderHeader() }
                        <div className="add-setting-editor">
                            <SettingRow
                                typeName={"-"}
                                website={"-"}
                                activeStatus={"-"}
                                fileName={""}
                                logTypeKey={"-"}
                                index={"add"}
                                key={"logSetting-add"}
                                closeOnClick={true}
                                openId={this.state.openId }
                                OpenCollapse={this.toggle.bind(this) }
                                Collapse={this.collapse.bind(this) }
                                id={"add"}
                                visible={opened}>
                                <LogSettingEditor
                                    logTypeList={logTypeOptions}
                                    portalList={portalOptions }
                                    keepMostRecentOptions={this.props.keepMostRecentOptions}
                                    thresholdsOptions={this.props.thresholdsOptions}
                                    notificationTimesOptions={this.props.notificationTimesOptions}
                                    notificationTimeTypesOptions={this.props.notificationTimeTypesOptions}
                                    logTypeSettingId=""  Collapse={this.collapse.bind(this) }  id={"add"} openId={this.state.openId}/>
                            </SettingRow>

                        </div>
                        {this.renderedLogSettingList(logTypeOptions, portalOptions) }
                    </div>
                </div>
            </div >
        );
    }
}

LogSettingsPanel.propTypes = {
    dispatch: PropTypes.func.isRequired,
    tabIndex: PropTypes.number,
    logTypeList: PropTypes.array,
    logSettingList: PropTypes.array,
    portalList: PropTypes.array,
    logTypeSetting: PropTypes.object,
    keepMostRecentOptions: PropTypes.array.isRequired,
    thresholdsOptions: PropTypes.array.isRequired,
    notificationTimesOptions: PropTypes.array.isRequired,
    notificationTimeTypesOptions: PropTypes.array.isRequired
};

function mapStateToProps(state) {
    return {
        logSettingList: state.logSettings.logSettingList,
        logTypeList: state.log.logTypeList,
        portalList: state.log.portalList,
        keepMostRecentOptions: state.logSettings.keepMostRecentOptions,
        thresholdsOptions: state.logSettings.thresholdsOptions,
        notificationTimesOptions: state.logSettings.notificationTimesOptions,
        notificationTimeTypesOptions: state.logSettings.notificationTimeTypesOptions,
        tabIndex: state.pagination.tabIndex
    };
}

export default connect(mapStateToProps)(LogSettingsPanel);