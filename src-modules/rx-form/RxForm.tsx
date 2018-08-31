import { cloneDeep, Dictionary, keys } from "lodash";
import * as React from "react";
import { Subject } from "rxjs/internal/Subject";
import { Subscription } from "rxjs/internal/Subscription";
import { Observer } from "rxjs/internal/types";
import { FieldActionTypes, IFieldAction, IFieldState, TFieldValue } from "./Field";
import { FormContext } from "./FormContext";
import { TChildrenRender } from "./types";
import { isContainError, log, setErrors, toFormValues, toObjWithKeyPath } from "./utils";

export interface IFormState {
  [fieldName: string]: IFieldState;
}

export interface IFormValues {
  [fieldName: string]: TFieldValue;
}

export type TErrors = Dictionary<string | undefined>;
type TOnSubmit = (values: IFormValues, onSubmitError: (errors: TErrors) => any) => any;

interface IRxFormInnerProps {
  handleSubmit: (onSubmit: TOnSubmit) => (formEvent: React.FormEvent) => any;
}

export interface IRxFormProps {
  children: TChildrenRender<IRxFormInnerProps>;
  initialValues?: IFormValues | IFormValues[];
}

export interface IFormAction {
  type: string;
  payload: {
    formState: IFormState;
  };
}

export enum FormActionTypes {
  initialize = "@@rx-form/form/INITIALIZE",
  startSubmit = "@@rx-form/form/START_SUBMIT",
  startSubmitFailed = "@@rx-form/form/START_SUBMIT_FAILED",
  onChange = "@@rx-form/form/CHANGE",
}

export class RxForm extends React.Component<IRxFormProps> {
  private formState = {} as IFormState;
  private formStateSubject$ = new Subject();
  private formActionSubject$ = new Subject();
  private formStateSubscription: Subscription | null = null;

  componentDidMount() {
    this.dispatch({
      type: FormActionTypes.initialize,
      payload: {
        formState: this.formState,
      },
    });

    if (this.props.initialValues) {
      this.setFormValues(this.props.initialValues);
    }
  }

  setFormValues = (formValues: IFormValues) => {
    const values = toObjWithKeyPath(formValues!);
    // create a empty object, in case merge deleted field back
    const nextFormState = {} as IFormState;
    keys(values).forEach((key) => {
      if (this.formState[key]) {
        this.formState[key].value === values[key]
          ? (nextFormState[key] = {
              ...this.formState[key],
              value: values[key],
              name: key,
            })
          : (nextFormState[key] = this.formState[key]);
      }
    });
    this.formState = nextFormState;
    this.dispatch({
      type: FormActionTypes.onChange,
      payload: {
        formState: this.formState,
      },
    });
    this.formStateSubject$.next(this.formState);
  };

  componentWillUnmount() {
    if (this.formStateSubscription) {
      this.formStateSubscription.unsubscribe();
      this.formStateSubscription = null;
    }
  }

  updateField = (action: IFieldAction) => {
    this.formState[action.payload.name] = action.payload;
    this.formStateSubject$.next(this.formState);
  };

  onSubmitError = (errors: TErrors) => {
    this.formState = setErrors(this.formState, errors);
    this.formStateSubject$.next(this.formState);
    this.dispatch({
      type: FormActionTypes.startSubmitFailed,
      payload: {
        formState: this.formState,
      },
    });
  };

  notifyFormActionChange = (action: IFormAction) => {
    this.formActionSubject$.next(action);
  };

  getFormValues = () => {
    return toFormValues(this.formState);
  };

  dispatch = (action: IFieldAction | IFormAction) => {
    const prevState = cloneDeep(this.formState);

    switch (action.type) {
      case FieldActionTypes.register: {
        this.updateField(action as IFieldAction);
        break;
      }
      case FieldActionTypes.change: {
        this.updateField(action as IFieldAction);
        break;
      }
      case FormActionTypes.initialize: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
      case FormActionTypes.startSubmit: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
      case FormActionTypes.startSubmitFailed: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
      case FormActionTypes.onChange: {
        this.notifyFormActionChange(action as IFormAction);
        break;
      }
    }

    const nextState = cloneDeep(this.formState);
    log({
      action,
      prevState,
      nextState,
    });
  };

  subscribe = (observer: Observer<any>) => {
    return this.formStateSubject$.subscribe(observer);
  };

  subscribeFormAction = (observer: Observer<any>) => {
    return this.formActionSubject$.subscribe(observer);
  };

  handleSubmit = (onSubmit: TOnSubmit) => {
    return (evt: React.FormEvent) => {
      evt.preventDefault();

      this.dispatch({
        type: FormActionTypes.startSubmit,
        payload: {
          formState: this.formState,
        },
      });

      if (isContainError(this.formState)) {
        return;
      }

      const values = this.getFormValues();
      if (values) {
        onSubmit(values, this.onSubmitError);
      }
    };
  };

  updateFormValues = (formValues: IFormValues) => {
    this.setFormValues(formValues);
  };

  render() {
    return (
      <FormContext.Provider
        value={{
          subscribe: this.subscribe,
          dispatch: this.dispatch,
          subscribeFormAction: this.subscribeFormAction,
          updateFormValues: this.updateFormValues,
        }}
      >
        {this.props.children({
          handleSubmit: this.handleSubmit,
        })}
      </FormContext.Provider>
    );
  }
}
