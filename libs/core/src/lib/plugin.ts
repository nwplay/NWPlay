
export abstract class Plugin {
  public abstract name: string;
  public abstract id: string;
  public version = '0.0.1';
  public icon?: string;
  public description?: string;
  public disabled? = false;
  public settings?: PluginSetting[] = [];
  public init?(setMessage: (text: string) => void): Promise<void>;
}


export abstract class PluginSetting<T = any> {
  label: string;
  value: T;
  id: string;
  public abstract type: string;
}

export class PluginInputSetting extends PluginSetting<string> {
  constructor(options: Partial<PluginInputSetting>) {
    super();
    Object.assign(this, options);
  }

  type = 'input';
}

export class PluginButtonSetting extends PluginSetting<string> {
  constructor(options: Partial<PluginButtonSetting>) {
    super();
    Object.assign(this, options);
  }

  click: CallableFunction;
  type = 'button';
}


export class PluginCheckboxSetting extends PluginSetting<boolean> {
  constructor(options: Partial<PluginCheckboxSetting>) {
    super();
    Object.assign(this, options);
  }

  type = 'checkbox';
}

export interface PluginSettingSelectItem {
  value: any;
  label: string;
}

export class PluginSelectSetting extends PluginSetting<any> {
  constructor(options: Partial<PluginSelectSetting>) {
    super();
    Object.assign(this, options);
  }

  type = 'select';
  public items: PluginSettingSelectItem[];
}

export class PluginMultiSelectSetting extends PluginSetting<any> {
  constructor(options: Partial<PluginMultiSelectSetting>) {
    super();
    Object.assign(this, options);
  }

  type = 'multi-select';
  public items: PluginSettingSelectItem[];
}
