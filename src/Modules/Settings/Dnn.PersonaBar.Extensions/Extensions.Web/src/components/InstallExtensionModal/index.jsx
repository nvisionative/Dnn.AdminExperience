import React, { PropTypes, Component } from "react";
import { connect } from "react-redux";
import GridCell from "dnn-grid-cell";
import SocialPanelHeader from "dnn-social-panel-header";
import SocialPanelBody from "dnn-social-panel-body";
import InstallLog from "./InstallLog";
import { ExtensionActions, InstallationActions, PaginationActions } from "actions";
import PackageInformation from "../EditExtension/PackageInformation";
import ReleaseNotes from "../Editextension/ReleaseNotes";
import License from "../EditExtension/License";
import Button from "dnn-button";
import Localization from "localization";
import utilities from "utils";
import FileUpload from "./FileUpload";
import Checkbox from "dnn-checkbox";
import styles from "./style.less";
class InstallExtensionModal extends Component {
    constructor() {
        super();
        this.state = {
            package: null,
            wizardStep: 0,
            repairInstallChecked: false
        };
    }

    onPackageChange(event) {
        const files = event.target.files;

        if (files && files.length > 0) {
            this.setState({
                package: files[0]
            });
        }
    }

    goToStep(wizardStep) {
        const { props } = this;
        props.dispatch(InstallationActions.navigateWizard(wizardStep));
    }

    parsePackage(file, callback, errorCallback) {
        if (!file) {
            utilities.utilities.notifyError(Localization.get("InstallExtension_EmptyPackage.Error"));
            return;
        }
        const {props} = this;
        this.setState({
            package: file
        }, () => {
            props.dispatch(InstallationActions.parsePackage(file, data => {
                data = JSON.parse(data);
                if (!data.success) {
                    if (errorCallback) {
                        errorCallback();
                    }
                }
                if (callback) {
                    callback(data.alreadyInstalled);
                }
            }, () => {
                if (errorCallback) {
                    errorCallback();
                }
            }));
        });
    }

    goToReleaseNotes() {
        this.goToStep(2);
    }

    goToLicense() {
        this.goToStep(3);
    }

    installPackage() {
        const {props} = this;
        if (!props.installingAvailablePackage) {
            props.dispatch(InstallationActions.installExtension(this.state.package, props.parsedInstallationPackage, () => {
                this.goToStep(4);
            }, !props.parsedInstallationPackage.alreadyInstalled));
        } else {
            props.dispatch(ExtensionActions.installAvailablePackage(props.availablePackage.PackageType, props.availablePackage.FileName, props.parsedInstallationPackage, () => {
                this.goToStep(4);
            }));
        }
    }

    onCheckRepairInstall(value) {
        this.setState({
            repairInstallChecked: value
        });
    }

    cancelInstall(cancelRevertStep) {
        const {props} = this;
        props.dispatch(InstallationActions.clearParsedInstallationPackage(() => {
            if (cancelRevertStep) {
                this.goToStep(0);
            } else {
                this.goToStep(0);
                props.onCancel();
            }
        }));
        props.dispatch(InstallationActions.notInstallingAvailablePackage());
        props.dispatch(InstallationActions.toggleAcceptLicense(false));
        this.setState({
            package: null
        });
    }

    getPackageInformationStep() {
        const {props} = this;
        if (props.parsedInstallationPackage) {
            return <PackageInformation
                extensionBeingEdited={props.parsedInstallationPackage}
                validationMapped={false}
                onCancel={this.cancelInstall.bind(this)}
                installationMode={true}
                onSave={this.goToReleaseNotes.bind(this)}
                primaryButtonText="Next"
                disabled={true} />;
        }
    }

    endInstallation() {
        const { props } = this;
        if (props.installingAvailablePackage) {
            props.dispatch(PaginationActions.loadTab(0, () => {
                props.dispatch(ExtensionActions.getInstalledPackages(props.availablePackage.PackageType));
                props.dispatch(ExtensionActions.getAvailablePackages(props.availablePackage.PackageType));
            }));
        } else {
            if (props.tabIndex !== 0) {
                props.dispatch(PaginationActions.loadTab(0));
            }
            if (props.parsedInstallationPackage.packageType !== props.selectedInstalledPackageType) {
                props.dispatch(ExtensionActions.getInstalledPackages(props.parsedInstallationPackage.packageType));
            }
        }
        props.onCancel();
        this.cancelInstall();
    }
    onToggleLicenseAccept() {
        this.props.dispatch(InstallationActions.toggleAcceptLicense(!this.props.licenseAccepted));
    }
    toggleViewLog(value) {
        this.props.dispatch(InstallationActions.setViewingLog(value));
    }
    clearParsedInstallationPackage() {
        this.props.dispatch(InstallationActions.clearParsedInstallationPackage());
    }
    render() {
        const {props} = this;
        const {wizardStep} = props;
        return (
            <GridCell className={styles.installExtensionModal}>
                <SocialPanelHeader title={Localization.get("ExtensionInstall.Action")} />
                <SocialPanelBody>
                    <GridCell className="install-extension-box extension-form">
                        {wizardStep === 0 &&
                            <GridCell>
                                <h3 className="box-title">{Localization.get("InstallExtension_UploadPackage.Header")}</h3>
                                <p>{Localization.get("InstallExtension_UploadPackage.HelpText")}</p>
                                <GridCell className="upload-package-box">
                                    <FileUpload
                                        parsePackage={this.parsePackage.bind(this)}
                                        repairInstall={this.goToStep.bind(this, 1)}
                                        cancelInstall={this.cancelInstall.bind(this)}
                                        parsedInstallationPackage={props.parsedInstallationPackage}
                                        toggleViewLog={this.toggleViewLog.bind(this)}
                                        clearParsedInstallationPackage={this.clearParsedInstallationPackage.bind(this)}
                                        viewingLog={props.viewingLog}
                                        />
                                </GridCell>
                                <GridCell className="modal-footer">
                                    <Button onClick={!props.viewingLog ? props.onCancel.bind(this) : this.toggleViewLog.bind(this, false)}>{Localization.get("InstallExtension_Cancel.Button")}</Button>
                                    <Button onClick={this.goToStep.bind(this, 1)} type="primary" disabled={!props.parsedInstallationPackage || !props.parsedInstallationPackage.success}>{Localization.get("InstallExtension_Upload.Button")}</Button>
                                </GridCell>
                            </GridCell>
                        }
                        {wizardStep === 1 && this.getPackageInformationStep()}
                        {wizardStep === 2 &&
                            <ReleaseNotes
                                value={props.parsedInstallationPackage.releaseNotes}
                                onCancel={this.cancelInstall.bind(this)}
                                onSave={this.goToLicense.bind(this)}
                                primaryButtonText={Localization.get("Next.Button")}
                                installationMode={true}
                                readOnly={true}
                                disabled={true} />}
                        {wizardStep === 3 &&
                            <License
                                value={props.parsedInstallationPackage.license}
                                onCancel={this.cancelInstall.bind(this)}
                                installationMode={true}
                                readOnly={true}
                                onSave={this.installPackage.bind(this)}
                                primaryButtonText={Localization.get("Next.Button")}
                                disabled={true}
                                primaryButtonDisabled={!props.licenseAccepted}
                                acceptLicenseCheckbox={
                                    <Checkbox
                                        label={Localization.get("InstallExtension_AcceptLicense.Label")}
                                        value={props.licenseAccepted}
                                        onCancel={this.cancelInstall.bind(this)}
                                        onChange={this.onToggleLicenseAccept.bind(this)} />}
                                />}
                        {wizardStep === 4 &&
                            <InstallLog
                                logs={props.installationLogs}
                                onDone={this.endInstallation.bind(this)}
                                primaryButtonText={Localization.get("Next.Button")} />}

                        <p className="modal-pagination">{"-- " + (props.wizardStep + 1) + " of 5 --"} </p>
                    </GridCell>
                </SocialPanelBody>
            </GridCell>
        );
    }
}

InstallExtensionModal.propTypes = {
    dispatch: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    parsedInstallationPackage: PropTypes.object,
    selectedInstalledPackageType: PropTypes.string,
    wizardStep: PropTypes.number,
    installationLogs: PropTypes.array,
    installingAvailablePackage: PropTypes.bool,
    availablePackage: PropTypes.object,
    licenseAccepted: PropTypes.bool,
    viewingLog: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        parsedInstallationPackage: state.installation.parsedInstallationPackage,
        selectedInstalledPackageType: state.extension.selectedInstalledPackageType,
        wizardStep: state.installation.installWizardStep,
        installationLogs: state.installation.installationLogs,
        installingAvailablePackage: state.installation.installingAvailablePackage,
        availablePackage: state.installation.availablePackage,
        licenseAccepted: state.installation.licenseAccepted,
        viewingLog: state.installation.viewingLog
    };
}

export default connect(mapStateToProps)(InstallExtensionModal);