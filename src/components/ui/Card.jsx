import { classNames } from '../../utils/helpers';

const Card = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  ...props
}) => {
  return (
    <div
      className={classNames(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              )}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex space-x-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
