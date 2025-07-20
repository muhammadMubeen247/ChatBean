import img1 from '../images/img1.jpg';
import img2 from '../images/img2.jpg';
import img3 from '../images/img3.jpg';
import img4 from '../images/img4.jpg';
import img5 from '../images/img5.jpg';
import img6 from '../images/img6.jpg';
import img7 from '../images/img7.jpg';
import img8 from '../images/img8.jpg';
import img9 from '../images/img9.jpg';

const AuthImagePattern = ({ title, subtitle }) => {
  const imageUrls = [img1, img2, img3, img4, img5, img6, img7, img8, img9];  
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {imageUrls.map((url, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center ${
                i % 2 === 0 ? "" : "animate-pulse"
              }`}
            >
              <img src={url} alt={`Pattern ${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;