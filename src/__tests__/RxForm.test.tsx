import { mount } from "enzyme";
import * as React from "react";
import { CustomInput } from "src-components";
import { Field } from "../Field";
import { RxForm } from "../RxForm";

describe("#updateFormValues", () => {
  it("should correctly set form values", () => {
    const { instance } = createForm();
    instance.updateFormValues({ firstName: "rui", address: [{ street1: "street1" }, { street2: "street2" }] });
    expect(instance.formState.values).toEqual({
      firstName: "rui",
      address: [{ street1: "street1" }, { street2: "street2" }],
    });
  });
});

const createForm = () => {
  const submit = () => {};

  const wrapper = mount(
    <RxForm>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit(submit)}>
          <div>
            <Field name="firstName">
              {(fieldProps) => <CustomInput {...fieldProps} type="text" placeholder="First Name" />}
            </Field>
          </div>
        </form>
      )}
    </RxForm>,
  );
  return {
    wrapper,
    instance: wrapper.instance(),
  } as any;
};
