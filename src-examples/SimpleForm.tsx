import { Field, RxForm } from "@reeli/react-rx-form";
import * as React from "react";

export class SimpleForm extends React.Component {
  static tsc() {
    return require(`!!raw-loader!../src-examples/SimpleForm.tsx`);
  }

  onSubmit = (values: any) => {
    alert(JSON.stringify(values, null, 2));
  };

  render() {
    return (
      <RxForm>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <Field name="firstName">
              {({ value = "", onChange, onFocus, onBlur, name }) => (
                <input
                  name={name}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onFocus={onFocus}
                  onBlur={(e) => onBlur(e.target.value)}
                  type="text"
                  placeholder="First Name"
                />
              )}
            </Field>
            <Field name="lastName">
              {({ value = "", onChange, onFocus, onBlur, name }) => (
                <input
                  name={name}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onFocus={onFocus}
                  onBlur={(e) => onBlur(e.target.value)}
                  type="password"
                  placeholder="Last Name"
                />
              )}
            </Field>
            <Field name="email">
              {({ value = "", onFocus, onBlur, onChange }) => (
                <input
                  name={name}
                  value={value}
                  onFocus={onFocus}
                  onBlur={(e) => onBlur(e.target.value)}
                  onChange={(e) => onChange(e.target.value)}
                  type="email"
                  placeholder="Email"
                />
              )}
            </Field>
            <Field name="checkbox" defaultValue={false}>
              {({ value = false, onBlur, onFocus, onChange, name }) => (
                <input
                  name={name}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onFocus={onFocus}
                  onBlur={(e) => onBlur(e.target.value)}
                  type={"checkbox"}
                  placeholder="Checkbox"
                />
              )}
            </Field>
            <div>
              <label>
                <Field name="sex">
                  {({ onChange, name, onBlur, onFocus }) => (
                    <input
                      name={name}
                      onFocus={onFocus}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={(e) => onBlur(e.target.value)}
                      type="radio"
                      value="male"
                    />
                  )}
                </Field>
                male
              </label>
              <label>
                <Field name="sex">
                  {({ onChange, name, onBlur, onFocus }) => (
                    <input
                      name={name}
                      onFocus={onFocus}
                      onBlur={(e) => onBlur(e.target.value)}
                      onChange={(e) => onChange(e.target.value)}
                      type="radio"
                      value="female"
                    />
                  )}
                </Field>
                female
              </label>
            </div>
            <button type="submit">Submit</button>
          </form>
        )}
      </RxForm>
    );
  }
}
